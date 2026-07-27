import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateChallanDto {
  @ApiPropertyOptional({ example: 'GJ01AB1234' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  truckNumber?: string;

  @ApiPropertyOptional({ example: 'Rajkot Site' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  placeOfDelivery?: string;

  @ApiPropertyOptional({ example: '2026-07-25' })
  @IsOptional()
  @IsDateString()
  challanDate?: string;

  @ApiPropertyOptional({ example: '14:30' })
  @IsOptional()
  @IsString()
  challanTime?: string;
}
