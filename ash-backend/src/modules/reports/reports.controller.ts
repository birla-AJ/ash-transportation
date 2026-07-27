import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryChallanDto } from '../challans/dto/query-challan.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get challan report rows with per-column filters, top filters (truck/duration/custom range) and global search',
  })
  async getReport(@Query() query: QueryChallanDto) {
    return this.reportsService.getReport(query);
  }
}
