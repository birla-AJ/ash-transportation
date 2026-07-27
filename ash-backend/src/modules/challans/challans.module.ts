import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ChallansController } from './challans.controller';
import { ChallansService } from './challans.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [ChallansController],
  providers: [ChallansService],
  exports: [ChallansService],
})
export class ChallansModule {}
