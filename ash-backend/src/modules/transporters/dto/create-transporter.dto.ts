import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export const TRANSPORTER_TEMPLATE_TYPES = ['NTPC_CHALLAN', 'VEDANT_LOADING_TOKEN'] as const;

export class CreateTransporterDto {
  @ApiProperty({ example: 'SONU MONU ROADLINES' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'SANDASINGHA, SASON, SANDASINGHA, SAMBAPUR, ODISHA INDIA- 768003' })
  @IsString()
  @MinLength(5)
  address: string;

  @ApiPropertyOptional({
    example: 'NTPC_CHALLAN',
    enum: TRANSPORTER_TEMPLATE_TYPES,
    description: 'Which printed challan layout this transporter uses.',
  })
  @IsOptional()
  @IsIn(TRANSPORTER_TEMPLATE_TYPES)
  templateType?: (typeof TRANSPORTER_TEMPLATE_TYPES)[number];
}
