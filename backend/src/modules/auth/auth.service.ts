import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * login authenticates the user against Supabase Auth,
   * then fetches their record from the `users` table to verify
   * is_active status and return their role + department.
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await this.databaseService.client.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      console.error('Supabase Auth Error:', authError?.message);
      throw new UnauthorizedException(authError?.message || 'Invalid email or password');
    }

    const userId = authData.user.id;

    // 2. Fetch the user's role, status, and department from the `users` table
    const { data: user, error: userError } = await this.databaseService.client
      .from('users')
      .select('role, is_active, department, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new UnauthorizedException('User record not found.');
    }

    // 3. Block inactive accounts
    if (!user.is_active) {
      throw new ForbiddenException('Account is inactive. Please complete your email invitation.');
    }

    // 4. Return token + identifying claims
    return {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      role: user.role,
      department: user.department,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  }

  /**
   * changePassword verifies the current password then updates to the new one.
   */
  async changePassword(userId: string, email: string, currentPassword: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters.');
    }

    // Verify current password
    const { error: signInError } = await this.databaseService.client.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInError) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    // Update password via admin API (service role — no OTP needed)
    const { error: updateError } = await this.databaseService.client.auth.admin.updateUserById(
      userId,
      { password: newPassword },
    );
    if (updateError) {
      throw new BadRequestException(updateError.message || 'Failed to update password.');
    }

    await this.databaseService.client
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'password_changed',
        message: 'Your password has been changed successfully. If you did not do this, contact an administrator immediately.',
        is_read: false,
        reference_id: null,
      });

    return { message: 'Password changed successfully.' };
  }

  /**
   * requestPasswordReset creates a pending password reset request for super admin review.
   * Only one pending request per user is allowed at a time.
   */
  async requestPasswordReset(user: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  }) {
    const { data: existing } = await this.databaseService.client
      .from('password_reset_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      throw new ConflictException('You already have a pending password reset request.');
    }

    const { data, error } = await this.databaseService.client
      .from('password_reset_requests')
      .insert({
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException('Failed to submit password reset request.');
    }

    // Notify the requesting user
    await this.databaseService.client
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'password_reset_requested',
        message: 'Your password reset request has been submitted. A super admin will review it shortly.',
        is_read: false,
        reference_id: data.id,
      });

    // Notify all super admins
    const { data: superAdmins } = await this.databaseService.client
      .from('users')
      .select('id')
      .eq('role', 'super_admin')
      .eq('is_active', true);

    if (superAdmins?.length) {
      await this.databaseService.client
        .from('notifications')
        .insert(
          superAdmins.map((sa) => ({
            user_id: sa.id,
            type: 'password_reset_requested',
            message: `${user.first_name} ${user.last_name} (${user.email}) has submitted a password reset request.`,
            is_read: false,
            reference_id: data.id,
          })),
        );
    }

    return {
      message: 'Password reset request submitted. A super admin will review it shortly.',
      request: data,
    };
  }

  /**
   * forgotPassword creates a password reset request by email without requiring a session.
   * Always returns success to avoid leaking whether an account exists.
   */
  async forgotPassword(email: string) {
    const { data: user } = await this.databaseService.client
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    // Silently succeed if user not found, inactive, or already has a pending request
    if (!user || !user.is_active || !['student', 'admin'].includes(user.role)) {
      return { message: 'If an account exists for that email, your request has been submitted.' };
    }

    const { data: existing } = await this.databaseService.client
      .from('password_reset_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (!existing) {
      const { data: newRequest } = await this.databaseService.client
        .from('password_reset_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: 'pending',
        })
        .select()
        .single();

      // Notify the user
      await this.databaseService.client
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'password_reset_requested',
          message: 'Your password reset request has been submitted. A super admin will review it shortly.',
          is_read: false,
          reference_id: newRequest?.id ?? null,
        });

      // Notify all super admins
      const { data: superAdmins } = await this.databaseService.client
        .from('users')
        .select('id')
        .eq('role', 'super_admin')
        .eq('is_active', true);

      if (superAdmins?.length) {
        await this.databaseService.client
          .from('notifications')
          .insert(
            superAdmins.map((sa) => ({
              user_id: sa.id,
              type: 'password_reset_requested',
              message: `${user.first_name} ${user.last_name} (${user.email}) has submitted a password reset request.`,
              is_read: false,
              reference_id: newRequest?.id ?? null,
            })),
          );
      }
    }

    return { message: 'If an account exists for that email, your request has been submitted.' };
  }

  /**
   * setPassword sets a new password for a user.
   * The caller must be pre-validated by RecoveryTokenGuard, which
   * resolves the userId from the recovery token before this runs.
   */
  async setPassword(userId: string, password: string) {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters.');
    }

    const { error } = await this.databaseService.client.auth.admin.updateUserById(
      userId,
      { password },
    );

    if (error) {
      throw new BadRequestException(error.message || 'Failed to set password.');
    }

    return { message: 'Password set successfully.' };
  }

  /**
   * refreshSession exchanges a refresh_token for a new access_token.
   */
  async refreshSession(refreshToken: string) {
    const { data, error } = await this.databaseService.client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Session could not be refreshed. Please log in again.');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  /**
   * logout invalidates the Supabase session server-side.
   */
  async logout() {
    const { error } = await this.databaseService.client.auth.signOut();
    if (error) {
      throw new UnauthorizedException('Failed to logout');
    }
    return { message: 'Logout successful' };
  }
}
