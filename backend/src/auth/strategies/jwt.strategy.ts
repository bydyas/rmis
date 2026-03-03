import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthTokenPayload } from '../auth.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: FastifyRequest) =>
          (req?.cookies as Record<string, string>)?.[
            configService.get<string>('ACCESS_TOKEN_NAME')!
          ] ?? null,
      ]),
      secretOrKey: configService.get('JWT_SECRET') as string,
    });
  }

  validate(payload: IAuthTokenPayload) {
    return { id: payload.sub, role: payload.role };
  }
}
