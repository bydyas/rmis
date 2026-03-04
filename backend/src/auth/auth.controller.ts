import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Environment, TEnvironment } from '../config/types.config';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { IAuthBody } from './auth.type';
import ms from 'ms';
import type { StringValue } from 'ms';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly isDevelopment: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isDevelopment =
      this.configService.get<TEnvironment>('NODE_ENV') ===
      Environment.DEVELOPMENT;
  }

  private get cookieSessionIdName() {
    const base = 'refresh_token';
    return this.isDevelopment ? base : `__Host-Http-${base}`;
  }

  private get cookieOptions() {
    return {
      httpOnly: true,
      path: '/',
      sameSite: (this.isDevelopment ? 'none' : 'strict') as 'strict' | 'none',
      secure: !this.isDevelopment,
      maxAge: ms(
        this.configService.get<StringValue>('REFRESH_TOKEN_EXPIRATION')!,
      ),
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered, access token set in cookie',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use',
  })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<IAuthBody> {
    const { accessToken, refreshToken } =
      await this.authService.register(createUserDto);
    res.setCookie(this.cookieSessionIdName, refreshToken, this.cookieOptions);
    return { accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logged in, access token set in cookie',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<IAuthBody> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);
    res.setCookie(this.cookieSessionIdName, refreshToken, this.cookieOptions);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Log out and clear the access token cookie' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out' })
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const accessToken = req['headers']['authorization']?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('sessions.invalid_token');
    }

    res.clearCookie(this.cookieSessionIdName);
    return this.authService.logout(accessToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Refresh the access token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Access token refreshed' })
  async refresh(@Req() req: FastifyRequest) {
    const accessToken = req['headers']['authorization']?.split(' ')[1];
    const refreshToken = req.cookies[this.cookieSessionIdName];

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('sessions.invalid_token');
    }

    return this.authService.refresh({ accessToken, refreshToken });
  }
}
