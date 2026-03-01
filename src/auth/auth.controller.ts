import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private get tokenName() {
    return this.configService.get<string>('ACCESS_TOKEN_NAME')!;
  }

  private get cookieOptions() {
    return {
      httpOnly: this.configService.get<boolean>('COOKIE_HTTP_ONLY'),
      path: this.configService.get<string>('COOKIE_PATH'),
      sameSite: this.configService.get<string>('COOKIE_SAME_SITE') as
        | 'strict'
        | 'lax'
        | 'none',
      secure: this.configService.get<boolean>('COOKIE_SECURE'),
      maxAge: this.configService.get<number>('COOKIE_MAX_AGE'),
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
  ) {
    const token = await this.authService.register(createUserDto);
    res.setCookie(this.tokenName, token, this.cookieOptions);
    return true;
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
  ) {
    const token = await this.authService.login(loginDto);
    res.setCookie(this.tokenName, token, this.cookieOptions);
    return true;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Log out and clear the access token cookie' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out' })
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie(this.tokenName, this.cookieOptions);
    return true;
  }
}
