import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateChallanDto {
  @ApiProperty({ example: 'GJ01AB1234' })
  @IsString()
  @MinLength(3)
  truckNumber: string;

  @ApiProperty({ example: 'Rajkot Site' })
  @IsString()
  @MinLength(2)
  placeOfDelivery: string;
}
