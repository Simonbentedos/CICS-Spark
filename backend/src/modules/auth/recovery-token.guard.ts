import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

/**
 * RecoveryTokenGuard protects the set-password endpoint.
 * It reads access_token from the request body, validates it
 * with Supabase Auth, and attaches req.recovery_user = { id }
 * so the controller/service can use it without re-validating.
 */
@Injectable()
export class RecoveryTokenGuard implements CanActivate {
  constructor(private readonly databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.body?.access_token;

    if (!accessToken || typeof accessToken !== 'string') {
      throw new UnauthorizedException('Recovery token is required.');
    }

    const {
      data: { user },
      error,
    } = await this.databaseService.client.auth.getUser(accessToken);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired recovery link.');
    }

    request.recovery_user = { id: user.id };
    return true;
  }
}
