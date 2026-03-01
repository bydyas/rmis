import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<string> {
    const existingUser = await this.usersService.get({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new UnauthorizedException('auth.users_exist');
    }
    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashed,
    });
    return this.jwtService.sign({ sub: user.id });
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.usersService.get({
      where: { email: loginDto.email },
      select: ['id', 'password'],
    });
    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('auth.invalid_credentials');
    }
    return this.jwtService.sign({ sub: user.id });
  }
}
