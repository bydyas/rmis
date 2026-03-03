import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    const user = await this.usersService.get({ where: { id } });

    if (!user) {
      throw new NotFoundException('users.user_not_found');
    }

    return user;
  }
}
