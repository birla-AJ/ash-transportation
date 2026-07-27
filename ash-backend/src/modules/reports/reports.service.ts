import { Injectable } from '@nestjs/common';
import { ChallansService } from '../challans/challans.service';
import { QueryChallanDto } from '../challans/dto/query-challan.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly challansService: ChallansService) {}

  async getReport(query: QueryChallanDto) {
    return this.challansService.findAll(query);
  }
}
