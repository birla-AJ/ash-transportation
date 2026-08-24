import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

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
}
