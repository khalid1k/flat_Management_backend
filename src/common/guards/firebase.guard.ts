import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseConfig } from 'src/config/firebase.config';
import { Public } from 'src/decorator/public.decorator';
import { UserService } from 'src/modules/users/services/users.service';
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private firebaseConfig: FirebaseConfig,
    private userService: UserService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(Public, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken = await this.firebaseConfig.auth.verifyIdToken(token);
      // request.user = decodedToken;
      if (!decodedToken?.uid || typeof decodedToken.uid !== 'string') {
        throw new UnauthorizedException('Invalid user UID');
      }

      request.userFirebaseId = decodedToken.uid;
      request.user = await this.userService.findByFirebaseId(decodedToken.uid);

      return true;
    } catch (error) {
      throw new UnauthorizedException(`Invalid token ${error.message}`);
    }
  }

  private extractToken(request: any): string | null {
    return request.headers.authorization?.split('Bearer ')[1] || null;
  }
}
