
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';

import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateChallanDto {

  @ApiProperty({ example: 'GJ01AB1234' })

  @IsString()

  @MinLength(3)

  // Truck/vehicle numbers are always stored uppercase, regardless of how
  // the client (website or mobile app) sends them.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))

  truckNumber: string;

  // Not mandatory anymore: for VEDANT_LOADING_TOKEN transporters, Driver
  // Name is the mandatory field instead (see ChallansService.create, which
  // enforces the right one based on the transporter's templateType).
  @ApiPropertyOptional({ example: 'Rajkot Site' })

  @IsOptional()

  @IsString()

  placeOfDelivery?: string;

  @ApiProperty({ example: 'a1b2c3d4-...', description: 'Selected transporter id' })

  @IsUUID()

  transporterId: string;

  // Only relevant when the selected transporter's templateType is

  // VEDANT_LOADING_TOKEN — the website only shows these fields on the Add

  // Challan form in that case. Mandatory for that template (enforced in
  // ChallansService.create), optional here at the DTO level since it
  // doesn't apply to other templates.

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

