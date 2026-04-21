import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../../database/database.module';
import { SupabaseGuard } from './supabase.guard';
import { RolesGuard } from './roles.guard';
import { DepartmentGuard } from './department.guard';
import { RecoveryTokenGuard } from './recovery-token.guard';

@Module({
  imports: [DatabaseModule],
  providers: [AuthService, SupabaseGuard, RolesGuard, DepartmentGuard, RecoveryTokenGuard],
  controllers: [AuthController],
  exports: [SupabaseGuard, RolesGuard, DepartmentGuard, RecoveryTokenGuard],
})
export class AuthModule {}
