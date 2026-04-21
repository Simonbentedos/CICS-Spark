import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

/**
 * ALTERNATIVE SupabaseGuard that uses users.id instead of auth.users.id
 * This would require significant changes throughout the system
 */
@Injectable()
export class SupabaseGuardAlternative implements CanActivate {
  constructor(private readonly databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT with Supabase Auth
    const {
      data: { user },
      error,
    } = await this.databaseService.client.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    // CHANGE: Look up user by EMAIL instead of auth ID
    const { data: userRecord, error: userError } = await this.databaseService.client
      .from('users')
      .select('id, role, is_active, department, first_name, last_name') // Include id
      .eq('email', user.email) // Use email lookup instead of ID
      .single();

    if (userError || !userRecord) {
      throw new UnauthorizedException('User record not found.');
    }

    if (!userRecord.is_active) {
      throw new UnauthorizedException('Account is inactive.');
    }

    // CHANGE: Use users.id instead of auth.users.id
    request.user = {
      id: userRecord.id,        // This is now users.id, not auth.users.id
      email: user.email,
      role: userRecord.role,
      department: userRecord.department,
      first_name: userRecord.first_name,
      last_name: userRecord.last_name,
      is_active: userRecord.is_active,
    };

    return true;
  }
}

/*
PROS of using users.id:
1. No ID mismatch issues
2. Full control over user IDs
3. Can use custom ID generation logic

CONS of using users.id:
1. RLS policies become more complex (need email lookup or mapping functions)
2. Performance impact (extra database lookups)
3. Breaks Supabase's standard auth pattern
4. More complex to maintain
5. Potential security issues if email changes

CURRENT APPROACH IS BETTER because:
- It follows Supabase best practices
- RLS policies are simpler and faster
- Less database lookups
- More secure (uses immutable auth.uid())
- The ID mismatch is a one-time fix, not a systemic issue
*/