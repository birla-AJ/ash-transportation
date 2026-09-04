import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { TRANSPORTER_TEMPLATE_TYPES } from './create-transporter.dto';

export class UpdateTransporterDto {
  @ApiPropertyOptional({ example: 'SONU MONU ROADLINES' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'SANDASINGHA, SASON, SANDASINGHA, SAMBAPUR, ODISHA INDIA- 768003' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  address?: string;

  @ApiPropertyOptional({ example: 'VEDANT_LOADING_TOKEN', enum: TRANSPORTER_TEMPLATE_TYPES })
  @IsOptional()
  @IsIn(TRANSPORTER_TEMPLATE_TYPES)
  templateType?: (typeof TRANSPORTER_TEMPLATE_TYPES)[number];
}
