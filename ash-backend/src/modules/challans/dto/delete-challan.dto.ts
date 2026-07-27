import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeleteChallanDto {
  @ApiProperty({ example: 'Duplicate entry created by mistake' })
  @IsString()
  @MinLength(3)
  reason: string;
}
