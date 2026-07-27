import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiPropertyOptional({ description: 'How many identical copies to print per challan' })
  @IsOptional()
  @IsInt()
  @Min(1)
  copiesPerPrint?: number;

  @ApiPropertyOptional({ enum: ['ESCPOS', 'USB_RAW'] })
  @IsOptional()
  @IsIn(['ESCPOS', 'USB_RAW'])
  printerType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  printerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  printerWidthMm?: number;

  @ApiPropertyOptional({ description: 'Printer calibration offsets, e.g. { marginTop: 2 }' })
  @IsOptional()
  @IsObject()
  printerCalibration?: Record<string, number>;
}
