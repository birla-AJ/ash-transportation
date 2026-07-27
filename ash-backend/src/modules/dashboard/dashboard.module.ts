import { Module } from '@nestjs/common';
import { ChallansModule } from '../challans/challans.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [ChallansModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
