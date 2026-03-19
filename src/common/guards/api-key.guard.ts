import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;
    const validKey = this.configService.getOrThrow<string>('ADMIN_API_KEY');

    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
