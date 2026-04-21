import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export type Permission = 
  | 'submissions.view'
  | 'submissions.review'
  | 'submissions.delete'
  | 'users.view'
  | 'users.create'
  | 'reports.view'
  | 'reports.export'
  | 'fulltext.manage';

export type AdminPermissions = {
  userId: string;
  permissions: Permission[];
};

// Map permission names to database column names
const PERMISSION_COLUMN_MAP: Record<Permission, string> = {
  'submissions.view': 'submissions_view',
  'submissions.review': 'submissions_review',
  'submissions.delete': 'submissions_delete',
  'users.view': 'users_view',
  'users.create': 'users_create',
  'reports.view': 'reports_view',
  'reports.export': 'reports_export',
  'fulltext.manage': 'fulltext_manage',
};

// All available permissions
const ALL_PERMISSIONS: Permission[] = [
  'submissions.view',
  'submissions.review',
  'submissions.delete',
  'users.view',
  'users.create',
  'reports.view',
  'reports.export',
  'fulltext.manage',
];

@Injectable()
export class PermissionsService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Get all permissions for a specific user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const { data, error } = await this.databaseService.client
      .from('admin_permissions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException('Failed to fetch user permissions');
    }

    if (!data) {
      return []; // User has no permissions row yet
    }

    // Convert wide format to array of granted permissions
    const permissions: Permission[] = [];
    for (const permission of ALL_PERMISSIONS) {
      const columnName = PERMISSION_COLUMN_MAP[permission];
      if (data[columnName] === true) {
        permissions.push(permission);
      }
    }

    return permissions;
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const columnName = PERMISSION_COLUMN_MAP[permission];
    
    const { data, error } = await this.databaseService.client
      .from('admin_permissions')
      .select(columnName)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException('Failed to check permission');
    }

    return data?.[columnName] === true;
  }

  /**
   * Get permissions for all admins in a department
   */
  async getDepartmentAdminPermissions(department: string): Promise<AdminPermissions[]> {
    // Get all admins in the department
    const { data: admins, error: adminsError } = await this.databaseService.client
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('department', department);

    if (adminsError) {
      throw new InternalServerErrorException('Failed to fetch admins');
    }

    if (!admins || admins.length === 0) {
      return [];
    }

    const adminIds = admins.map(a => a.id);

    // Get permissions for these admins
    const { data: permissionsData, error: permError } = await this.databaseService.client
      .from('admin_permissions')
      .select('*')
      .in('user_id', adminIds);

    if (permError) {
      throw new InternalServerErrorException('Failed to fetch permissions');
    }

    // Convert wide format to AdminPermissions array
    const result: AdminPermissions[] = [];
    
    for (const admin of admins) {
      const permRow = permissionsData?.find(p => p.user_id === admin.id);
      
      if (!permRow) {
        // Admin has no permissions row yet, return empty
        result.push({ userId: admin.id, permissions: [] });
        continue;
      }

      // Extract granted permissions from columns
      const permissions: Permission[] = [];
      for (const permission of ALL_PERMISSIONS) {
        const columnName = PERMISSION_COLUMN_MAP[permission];
        if (permRow[columnName] === true) {
          permissions.push(permission);
        }
      }

      result.push({ userId: admin.id, permissions });
    }

    return result;
  }

  /**
   * Update permissions for admins in a department (Super Admin only)
   */
  async updateDepartmentPermissions(
    department: string,
    adminPermissions: AdminPermissions[],
    currentUser: any,
  ): Promise<void> {
    // TEMPORARY DEBUG - Log everything to find the issue
    console.log('=== PERMISSION UPDATE DEBUG ===');
    console.log('Department:', department);
    console.log('Current User:', currentUser);
    console.log('Current User Role:', currentUser?.role);
    console.log('Role type:', typeof currentUser?.role);
    console.log('Role === "super_admin":', currentUser?.role === 'super_admin');
    console.log('Admin Permissions:', adminPermissions);
    console.log('===============================');
    
    // Only super_admin can update permissions
    if (currentUser.role !== 'super_admin') {
      console.log('PERMISSION DENIED - Role check failed');
      throw new ForbiddenException(`Permission denied. Role: "${currentUser?.role}" (expected: "super_admin")`);
    }
    
    console.log('PERMISSION CHECK PASSED - Proceeding with update');

    // Verify all users are admins in the specified department
    const userIds = adminPermissions.map(ap => ap.userId);
    const { data: users, error: usersError } = await this.databaseService.client
      .from('users')
      .select('id, role, department')
      .in('id', userIds);

    if (usersError) {
      throw new InternalServerErrorException('Failed to verify users');
    }

    for (const user of users || []) {
      if (user.role !== 'admin' || user.department !== department) {
        throw new ForbiddenException(`User ${user.id} is not an admin in ${department} department`);
      }
    }

    // Update permissions for each admin
    for (const adminPerm of adminPermissions) {
      // Build update object with all permission columns
      const updateData: any = {
        user_id: adminPerm.userId,
        updated_at: new Date().toISOString(),
      };

      // Set all permissions to false first
      for (const permission of ALL_PERMISSIONS) {
        const columnName = PERMISSION_COLUMN_MAP[permission];
        updateData[columnName] = false;
      }

      // Set granted permissions to true
      for (const permission of adminPerm.permissions) {
        const columnName = PERMISSION_COLUMN_MAP[permission];
        updateData[columnName] = true;
      }

      // Upsert (insert or update) the permissions row
      const { error: upsertError } = await this.databaseService.client
        .from('admin_permissions')
        .upsert(updateData);

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        throw new InternalServerErrorException(`Failed to update permissions: ${upsertError.message}`);
      }
    }
  }

  /**
   * Require permission - throws if user doesn't have it
   */
  async requirePermission(userId: string, permission: Permission): Promise<void> {
    const hasIt = await this.hasPermission(userId, permission);
    if (!hasIt) {
      throw new ForbiddenException(`You don't have permission: ${permission}`);
    }
  }
}
