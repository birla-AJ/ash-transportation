import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChallansService } from '../challans/challans.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly challansService: ChallansService) {}

  @Get()
  @ApiOperation({
    summary: "Get today's/monthly/yearly trip counts, recent challans and latest activity",
  })
  async getStats() {
    return this.challansService.dashboardStats();
  }
}
