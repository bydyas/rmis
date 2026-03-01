import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
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
import { SessionsService } from './sessions.service';
import { LoginDto } from './dto/login.dto';
import { Environment, TEnvironment } from 'src/config/types.config';

@ApiTags('Session')
@Controller('sessions')
export class SessionsController {
  private readonly isDevelopment: boolean;

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService,
  ) {
    this.isDevelopment =
      this.configService.get<TEnvironment>('NODE_ENV') ===
      Environment.DEVELOPMENT;
  }

  private get cookieSessionIdName() {
    return this.isDevelopment ? 'session-id' : `__Host-Http-session-id`;
  }

  private get cookieOptions() {
    return {
      httpOnly: true,
      path: '/',
      sameSite: (this.isDevelopment ? 'none' : 'strict') as 'strict' | 'none',
      secure: !this.isDevelopment,
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
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<string> {
    const result = await this.sessionsService.register(createUserDto, req);
    res.setCookie(this.cookieSessionIdName, result.sessionId, {
      ...this.cookieOptions,
      maxAge: result.expires,
    });
    return result.accessToken;
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
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<string> {
    const result = await this.sessionsService.login(loginDto, req);
    res.setCookie(this.cookieSessionIdName, result.sessionId, {
      ...this.cookieOptions,
      maxAge: result.expires,
    });
    return result.accessToken;
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
    const sessionId = req.cookies[this.cookieSessionIdName];
    if (sessionId) {
      await this.sessionsService.invalidate(sessionId);
    }
    res.clearCookie(this.cookieSessionIdName);
  }
}
