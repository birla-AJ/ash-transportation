import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ChallansController } from './challans.controller';
import { ChallansService } from './challans.service';
import { ChallanCounter, ChallanCounterSchema } from './schemas/challan-counter.schema';
import { Challan, ChallanSchema } from './schemas/challan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challan.name, schema: ChallanSchema },
      { name: ChallanCounter.name, schema: ChallanCounterSchema },
    ]),
    AuditLogsModule,
  ],
  controllers: [ChallansController],
  providers: [ChallansService],
  exports: [ChallansService],
})
export class ChallansModule {}
