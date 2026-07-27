import { Module } from '@nestjs/common';
import { ChallansModule } from '../challans/challans.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [ChallansModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
