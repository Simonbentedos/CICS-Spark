import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EmailService } from '../email/email.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class SuperadminService {
  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
  ) {}

  /**
   * createAdmin provisions a new admin account.
   *
   * Flow:
   *  1. Sends a Supabase invite email so the admin can set their own password.
   *  2. Inserts a row into `users` with role='admin' and is_active=false.
   *  3. A Supabase database trigger flips is_active=true once they confirm email.
   */
  async createAdmin(dto: CreateAdminDto) {
    const { email, first_name, last_name, department } = dto;

    // Guard against duplicate users
    const { data: existing } = await this.databaseService.client
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Generate a random temporary password for the new admin
    const tempPassword = 'Spark@' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
    const { data: authData, error: authError } =
      await this.databaseService.client.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      throw new InternalServerErrorException(
        authError?.message || 'Failed to create admin auth account.',
      );
    }

    const { data: user, error: userError } = await this.databaseService.client
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name,
        last_name,
        role: 'admin',
        department,
        is_active: true,
      })
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .single();

    if (userError) {
      // Roll back the auth user so we don't leave an orphaned auth record
      await this.databaseService.client.auth.admin.deleteUser(authData.user.id);
      throw new InternalServerErrorException(userError.message || 'Failed to create admin record.');
    }

    // Send welcome email (fire-and-forget — never block account creation)
    this.emailService.sendWelcomeEmail({
      to: email,
      name: `${first_name} ${last_name}`,
      role: 'admin',
      tempPassword,
    }).catch(() => {});

    return {
      message: 'Admin account created successfully.',
      admin: user,
    };
  }
}
