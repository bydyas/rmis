import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto';
import { IAuthBody, IAuthResult, IAuthTokenPayload } from './auth.type';

@Injectable()
export class AuthService {
  blacklist = new Set<string>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new user and returns a signed access and refresh token pair.
   * @param createUserDto - The registration payload containing email, password, and other user fields.
   * @throws {BadRequestException} If a user with the given email already exists.
   * @returns Access and refresh tokens for the newly created user.
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

    return this.generateTokens({ sub: user.id, role: user.role });
  }

  /**
   * Authenticates a user with email and password.
   * @param loginDto - The login payload containing email and password.
   * @throws {BadRequestException} If no user with the given email exists.
   * @throws {UnauthorizedException} If the password does not match.
   * @returns Access and refresh tokens for the authenticated user.
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

    return this.generateTokens({ sub: user.id, role: user.role });
  }

  /**
   * Issues a new access token using a valid refresh token.
   * If the old access token is still valid it is added to the blacklist to prevent reuse.
   * @param tokens - The current access and refresh token pair.
   * @throws {UnauthorizedException} If the refresh token is expired or invalid.
   * @returns A new access token signed from the refresh token's payload.
   */
  async refresh({
    accessToken,
    refreshToken,
  }: IAuthResult): Promise<IAuthBody> {
    const [refreshTokenVerification, accessTokenVerification] =
      await Promise.allSettled([
        this.jwtService.verifyAsync(refreshToken),
        this.jwtService.verifyAsync(accessToken),
      ]);

    if (refreshTokenVerification.status === 'rejected') {
      throw new UnauthorizedException('sessions.invalid_refresh_token');
    }

    if (accessTokenVerification.status === 'fulfilled') {
      this.blacklist.add(accessToken);
    }

    return {
      accessToken: this.generateTokens({
        sub: refreshTokenVerification.value.sub,
        role: refreshTokenVerification.value.role,
      }).accessToken,
    };
  }

  /**
   * Invalidates an access token by adding it to the in-memory blacklist.
   * If the token is already expired or invalid, the call is silently ignored.
   * @param accessToken - The access token to revoke.
   */
  async logout(accessToken: string): Promise<unknown> {
    return this.jwtService
      .verifyAsync(accessToken)
      .then(() => this.blacklist.add(accessToken))
      .catch(() => {});
  }

  /**
   * Signs and returns a new access and refresh token pair from the given payload.
   * @param payload - The JWT payload containing the user's id (`sub`) and role.
   * @returns A pair of signed JWT tokens with their respective expiration times.
   */
  private generateTokens(payload: IAuthTokenPayload): IAuthResult {
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
