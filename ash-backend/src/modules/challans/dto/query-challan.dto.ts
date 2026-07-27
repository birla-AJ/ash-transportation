import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryChallanDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by challan number (partial match)' })
  @IsOptional()
  @IsString()
  challanNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by truck number (partial match)' })
  @IsOptional()
  @IsString()
  truckNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by place of delivery (partial match)' })
  @IsOptional()
  @IsString()
  placeOfDelivery?: string;

  @ApiPropertyOptional({
    enum: ['today', 'week', 'month', 'year', 'custom'],
    description: 'Predefined or custom date range',
  })
  @IsOptional()
  @IsIn(['today', 'week', 'month', 'year', 'custom'])
  duration?: 'today' | 'week' | 'month' | 'year' | 'custom';

  @ApiPropertyOptional({ description: 'Required when duration=custom (ISO date)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Required when duration=custom (ISO date)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: false, description: 'Include soft-deleted challans' })
  @IsOptional()
  includeDeleted?: boolean;
}
