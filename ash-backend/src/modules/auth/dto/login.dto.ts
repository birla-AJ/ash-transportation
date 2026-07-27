import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@ashtransportation.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ChangeMe@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, default: false, description: 'Extend refresh token lifetime' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
