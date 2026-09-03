
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateChallanDto {

  @ApiProperty({ example: 'GJ01AB1234' })

  @IsString()

  @MinLength(3)

  truckNumber: string;

  @ApiProperty({ example: 'Rajkot Site' })

  @IsString()

  @MinLength(2)

  placeOfDelivery: string;

  @ApiProperty({ example: 'a1b2c3d4-...', description: 'Selected transporter id' })

  @IsUUID()

  transporterId: string;

  // Only relevant when the selected transporter's templateType is

  // VEDANT_LOADING_TOKEN — the website only shows these fields on the Add

  // Challan form in that case, so they stay optional here.

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

