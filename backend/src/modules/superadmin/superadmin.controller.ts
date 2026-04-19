import { Controller, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('superadmin')
@UseGuards(SupabaseGuard, RolesGuard)
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  /**
   * PATCH /api/superadmin/users/:id/disable
   * super_admin only. Disables an admin or student account.
   */
  @Patch('users/:id/disable')
  @Roles('super_admin')
  disableUser(@Param('id') id: string) {
    return this.superadminService.disableUser(id);
  }

  /**
   * PUT /api/superadmin/users/:id
   * super_admin only. Updates a user's name and department.
   */
  @Put('users/:id')
  @Roles('super_admin')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.superadminService.updateUser(id, updateUserDto);
  }

  /**
   * POST /api/superadmin/students
   * super_admin only. Creates a student account and sends an invite email.
   */
  @Post('students')
  @Roles('super_admin')
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.superadminService.createStudent(createStudentDto);
  }

  /**
   * POST /api/superadmin/admins
   * super_admin only. Creates an admin account and sends them an invite email.
   */
  @Post('admins')
  @Roles('super_admin')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.superadminService.createAdmin(createAdminDto);
  }
}
