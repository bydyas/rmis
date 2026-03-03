import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import { CreateUserDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto';
import { User } from '../users/entities';
import { IAuthResult, IAuthTokenPayload } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new user and creates an initial session.
   * @throws {UnauthorizedException} If a user with the given email already exists.
   * @returns A signed JWT access token.
   */
  async register(createUserDto: CreateUserDto): Promise<IAuthResult> {
    const existingUser = await this.usersService.get({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('sessions.user_exists');
    }

    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashed,
    });

    return this.generateTokens(user);
  }

  /**
   * Authenticates a user with email and password and creates a new session.
   * @throws {UnauthorizedException} If the credentials are invalid.
   * @returns A signed JWT access token.
   */
  async login(loginDto: LoginDto): Promise<IAuthResult> {
    const user = await this.usersService.get({
      where: { email: loginDto.email },
      select: ['id', 'password', 'role'],
    });

    if (!user) {
      throw new BadRequestException('users.user_not_found');
    }

    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('sessions.invalid_credentials');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: User): IAuthResult {
    const payload: IAuthTokenPayload = { sub: user.id, role: user.role };

    return {
      accessToken: this.jwtService.sign<IAuthTokenPayload>(payload, {
        expiresIn: this.configService.get<StringValue>(
          'ACCESS_TOKEN_EXPIRATION',
        )!,
      }),
      refreshToken: this.jwtService.sign<IAuthTokenPayload>(payload, {
        expiresIn: this.configService.get<StringValue>(
          'REFRESH_TOKEN_EXPIRATION',
        )!,
      }),
    };
  }
}
