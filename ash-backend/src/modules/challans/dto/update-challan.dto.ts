import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateChallanDto {
  @ApiPropertyOptional({ example: 'GJ01AB1234' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  // Truck/vehicle numbers are always stored uppercase, regardless of how
  // the client (website or mobile app) sends them.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  truckNumber?: string;

  // No MinLength: Place Of Delivery / Party Name is optional for
  // VEDANT_LOADING_TOKEN transporters and can be blank.
  @ApiPropertyOptional({ example: 'Rajkot Site' })
  @IsOptional()
  @IsString()
  placeOfDelivery?: string;

  @ApiPropertyOptional({ example: '2026-07-25' })
  @IsOptional()
  @IsDateString()
  challanDate?: string;

  @ApiPropertyOptional({ example: '14:30' })
  @IsOptional()
  @IsString()
  challanTime?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-...' })
  @IsOptional()
  @IsUUID()
  transporterId?: string;

  @ApiPropertyOptional({ example: 'Ramesh Kumar' })
  @IsOptional()
  @IsString()
  driverName?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  driverNumber?: string;

  @ApiPropertyOptional({ example: 'Suresh' })
  @IsOptional()
  @IsString()
  managerName?: string;
}
