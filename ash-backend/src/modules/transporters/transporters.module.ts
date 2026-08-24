import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { TransportersController } from './transporters.controller';
import { TransportersService } from './transporters.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [TransportersController],
  providers: [TransportersService],
  exports: [TransportersService],
})
export class TransportersModule {}
