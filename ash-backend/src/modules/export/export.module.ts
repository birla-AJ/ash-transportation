import { Module } from '@nestjs/common';
import { ChallansModule } from '../challans/challans.module';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  imports: [ChallansModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
