import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTransporterDto {
  @ApiProperty({ example: 'SONU MONU ROADLINES' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'SANDASINGHA, SASON, SANDASINGHA, SAMBAPUR, ODISHA INDIA- 768003' })
  @IsString()
  @MinLength(5)
  address: string;
}
