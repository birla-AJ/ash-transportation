import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SetSignatureDto {
  @ApiProperty({ description: 'Base64 data URL of the signature image' })
  @IsString()
  signatureImage: string;
}
