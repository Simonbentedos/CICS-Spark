import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EmailService } from '../email/email.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class SuperadminService {
  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
  ) {}

  /**
   * disableUser allows super_admin to disable admin/student accounts.
   */
  async disableUser(userId: string) {
    const { data: targetUser, error: fetchError } = await this.databaseService.client
      .from('users')
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      throw new InternalServerErrorException(fetchError.message);
    }

    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    if (!['admin', 'student'].includes(targetUser.role)) {
      throw new ForbiddenException('Only admin and student accounts can be disabled.');
    }

    const { data: disabledUser, error: updateError } = await this.databaseService.client
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .single();

    if (updateError || !disabledUser) {
      throw new InternalServerErrorException(
        updateError?.message || 'Failed to disable user account.',
      );
    }

    return {
      message: 'User account disabled successfully.',
      user: disabledUser,
    };
  }

  /**
   * enableUser allows super_admin to re-activate a disabled admin/student account.
   */
  async enableUser(userId: string) {
    const { data: targetUser, error: fetchError } = await this.databaseService.client
      .from('users')
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      throw new InternalServerErrorException(fetchError.message);
    }

    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    if (!['admin', 'student'].includes(targetUser.role)) {
      throw new ForbiddenException('Only admin and student accounts can be enabled.');
    }

    const { data: enabledUser, error: updateError } = await this.databaseService.client
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .single();

    if (updateError || !enabledUser) {
      throw new InternalServerErrorException(
        updateError?.message || 'Failed to enable user account.',
      );
    }

    return {
      message: 'User account enabled successfully.',
      user: enabledUser,
    };
  }

  /**
   * updateUser allows super_admin to edit user profile details.
   */
  async updateUser(userId: string, dto: UpdateUserDto) {
    const { first_name, last_name, department } = dto;

    const { data: existing, error: existingError } = await this.databaseService.client
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingError) {
      throw new InternalServerErrorException(existingError.message);
    }

    if (!existing) {
      throw new NotFoundException('User not found.');
    }

    const { data: updatedUser, error: updateError } = await this.databaseService.client
      .from('users')
      .update({
        first_name,
        last_name,
        department,
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .single();

    if (updateError || !updatedUser) {
      throw new InternalServerErrorException(
        updateError?.message || 'Failed to update user record.',
      );
    }

    return {
      message: 'User updated successfully.',
      user: updatedUser,
    };
  }

  /**
   * createStudent provisions a new student account.
   *
   * Flow:
   *  1. Sends a Supabase invite email so the student can set their own password.
   *  2. Inserts a row into `users` with role='student' and is_active=false.
   *  3. A Supabase database trigger flips is_active=true once they confirm email.
   */
  async createStudent(dto: CreateStudentDto) {
    const { email, first_name, last_name, department } = dto;

    // Guard against duplicate users
    const { data: existing } = await this.databaseService.client
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new ConflictException('A student with this email already exists.');
    }

    // Generate a random temporary password for the new student
    const tempPassword =
      'Spark@' +
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 6).toUpperCase();
    const { data: authData, error: authError } =
      await this.databaseService.client.auth.admin.inviteUserByEmail(email, {
        data: {
          first_name,
          last_name,
          role: 'student',
          department,
        },
      });

    if (authError || !authData.user) {
      throw new InternalServerErrorException(
        authError?.message || 'Failed to create student auth account.',
      );
    }

    const { data: user, error: userError } = await this.databaseService.client
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name,
        last_name,
        role: 'student',
        department,
        is_active: false,
      })
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .single();

    if (userError) {
      // Roll back the auth user so we don't leave an orphaned auth record
      await this.databaseService.client.auth.admin.deleteUser(authData.user.id);
      throw new InternalServerErrorException(
        userError.message || 'Failed to create student record.',
      );
    }

    // Send welcome email (fire-and-forget — never block account creation)
    this.emailService
      .sendWelcomeEmail({
        to: email,
        name: `${first_name} ${last_name}`,
        role: 'student',
        tempPassword,
      })
      .catch(() => {});

    return {
      message: 'Student account created successfully. An invite email has been sent.',
      student: user,
    };
  }

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

  /**
   * deleteSubmission permanently removes a submission and its PDF from storage.
   */
  async deleteSubmission(documentId: string) {
    const { data: doc, error: fetchError } = await this.databaseService.client
      .from('documents')
      .select('id, pdf_file_path')
      .eq('id', documentId)
      .maybeSingle();

    if (fetchError) {
      throw new InternalServerErrorException(fetchError.message);
    }

    if (!doc) {
      throw new NotFoundException('Submission not found.');
    }

    const { error: storageError } = await this.databaseService.client.storage
      .from('documents')
      .remove([doc.pdf_file_path]);

    if (storageError) {
      console.warn(`Storage delete failed for doc ${doc.id}: ${storageError.message}`);
    }

    const { error: dbError } = await this.databaseService.client
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw new InternalServerErrorException(dbError.message || 'Failed to delete submission.');
    }

    return { message: 'Submission deleted.' };
  }

  /**
   * listPasswordResetRequests returns all password reset requests, optionally filtered by status.
   */
  async listPasswordResetRequests(status?: string) {
    const validStatuses = ['pending', 'approved', 'declined'];

    let query = this.databaseService.client
      .from('password_reset_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (status && validStatuses.includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException('Failed to fetch password reset requests.');
    }

    return { requests: data };
  }

  /**
   * approvePasswordResetRequest marks the request approved and emails the user a Supabase recovery link.
   */
  async approvePasswordResetRequest(requestId: string) {
    const { data: request, error: fetchError } = await this.databaseService.client
      .from('password_reset_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (fetchError) throw new InternalServerErrorException(fetchError.message);
    if (!request) throw new NotFoundException('Password reset request not found.');
    if (request.status !== 'pending') {
      throw new ConflictException('This request has already been resolved.');
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const { data: linkData, error: linkError } =
      await this.databaseService.client.auth.admin.generateLink({
        type: 'recovery',
        email: request.email,
        options: {
          redirectTo: `${frontendUrl}/reset-password`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      throw new InternalServerErrorException('Failed to generate password reset link.');
    }

    const { error: updateError } = await this.databaseService.client
      .from('password_reset_requests')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) throw new InternalServerErrorException(updateError.message);

    this.emailService
      .sendPasswordResetEmail({
        to: request.email,
        name: `${request.first_name} ${request.last_name}`,
        resetLink: linkData.properties.action_link,
      })
      .catch(() => {});

    return { message: 'Password reset request approved. Recovery email sent.' };
  }

  /**
   * declinePasswordResetRequest marks the request declined and notifies the user by email.
   */
  async declinePasswordResetRequest(requestId: string) {
    const { data: request, error: fetchError } = await this.databaseService.client
      .from('password_reset_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (fetchError) throw new InternalServerErrorException(fetchError.message);
    if (!request) throw new NotFoundException('Password reset request not found.');
    if (request.status !== 'pending') {
      throw new ConflictException('This request has already been resolved.');
    }

    const { error: updateError } = await this.databaseService.client
      .from('password_reset_requests')
      .update({ status: 'declined', resolved_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) throw new InternalServerErrorException(updateError.message);

    this.emailService
      .sendPasswordResetDeclinedEmail({
        to: request.email,
        name: `${request.first_name} ${request.last_name}`,
      })
      .catch(() => {});

    return { message: 'Password reset request declined.' };
  }
}
