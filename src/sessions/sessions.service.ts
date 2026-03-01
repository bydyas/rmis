import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import ms from 'ms';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ISessionResult, ISessionToken } from './sessions.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { FastifyRequest } from 'fastify';
import { Session } from './entities';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities';
import type { StringValue } from 'ms';

@Injectable()
export class SessionsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  /**
   * Registers a new user and creates an initial session.
   * @throws {UnauthorizedException} If a user with the given email already exists.
   * @returns A signed JWT access token.
   */
  async register(
    createUserDto: CreateUserDto,
    req: FastifyRequest,
  ): Promise<ISessionResult> {
    const existingUser = await this.usersService
      .get({
        where: { email: createUserDto.email },
      })
      .catch(() => null);
    if (existingUser) {
      throw new UnauthorizedException('sessions.user_exists');
    }
    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashed,
    });
    const session = await this.persist(user, req);

    return {
      accessToken: this.jwtService.sign<ISessionToken>({ sub: user.id }),
      sessionId: session.id,
      expires: this.calcExpiration(session.expiresAt),
    };
  }

  /**
   * Authenticates a user with email and password and creates a new session.
   * @throws {UnauthorizedException} If the credentials are invalid.
   * @returns A signed JWT access token.
   */
  async login(
    loginDto: LoginDto,
    req: FastifyRequest,
  ): Promise<ISessionResult> {
    const user = await this.usersService.get({
      where: { email: loginDto.email },
      select: ['id', 'password'],
    });
    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('sessions.invalid_credentials');
    }
    const session = await this.persist(user, req);

    return {
      accessToken: this.jwtService.sign<ISessionToken>({ sub: user.id }),
      sessionId: session.id,
      expires: this.calcExpiration(session.expiresAt),
    };
  }

  /**
   * Invalidates a session.
   */
  async invalidate(sessionId: string) {
    return this.sessionsRepository.update(
      { id: sessionId },
      { isInvalidated: true },
    );
  }

  /**
   * Persists a new session record for the given user, capturing IP address,
   * user agent, language, and a fresh refresh token.
   */
  private async persist(user: User, req: FastifyRequest) {
    const expiresIn = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION',
    )! as StringValue;
    const session = await this.sessionsRepository.create({
      user,
      ipAddress: req.ip,
      refreshToken: this.jwtService.sign<ISessionToken>(
        { sub: user.id },
        { expiresIn },
      ),
      expiresAt: new Date(Date.now() + ms(expiresIn)),
      lastActivity: new Date(),
      userAgent: req.headers['user-agent'] || 'unknown',
      lang:
        <string>req.headers['x-lang'] ??
        this.configService.get<string>('FALLBACK_LANGUAGE')!,
    });
    return this.sessionsRepository.save(session);
  }

  private calcExpiration(expiresAt: Date): number {
    return Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  }

  // TODO: refresh access token
}
