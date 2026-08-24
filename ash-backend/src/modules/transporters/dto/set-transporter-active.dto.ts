import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetTransporterActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
