import { Controller, Post, Body, UseGuards, Get, Request, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SupabaseGuard } from './supabase.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Public. Authenticates a user and returns a session token, role, and department.
   * Tighter rate limit: 10 attempts per minute per IP.
   */
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /api/auth/logout
   * Protected. Invalidates the current Supabase session.
   */
  @UseGuards(SupabaseGuard)
  @Post('logout')
  async logout() {
    return this.authService.logout();
  }

  /**
   * GET /api/auth/me
   * Protected. Returns the currently authenticated user's profile
   * as populated by SupabaseGuard from the `users` table.
   */
  @UseGuards(SupabaseGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return req.user;
  }

  /**
   * POST /api/auth/change-password
   * Protected. Verifies current password, then updates to new password.
   */
  @UseGuards(SupabaseGuard)
  @Post('change-password')
  @HttpCode(200)
  changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.id,
      req.user.email,
      body.currentPassword,
      body.newPassword,
    );
  }

  /**
   * POST /api/auth/password-reset-request
   * Protected. Student or admin submits a password reset request for super admin approval.
   * Only one pending request per user is allowed at a time.
   */
  @UseGuards(SupabaseGuard, RolesGuard)
  @Roles('student', 'admin')
  @Post('password-reset-request')
  @HttpCode(201)
  requestPasswordReset(@Request() req: any) {
    return this.authService.requestPasswordReset(req.user);
  }
}
