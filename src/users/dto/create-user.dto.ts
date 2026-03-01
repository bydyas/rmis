import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.INVALID_EMAIL') })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  @MinLength(6, { message: i18nValidationMessage('validation.MIN') })
  password: string;
}
