import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ChallansModule } from '../challans/challans.module';
import { SuperAdminController } from './super-admin.controller';
import { SubAdminController } from './sub-admin.controller';

@Module({
  imports: [UsersModule, AuditLogsModule, ChallansModule],
  controllers: [SuperAdminController, SubAdminController],
})
export class AdminManagementModule {}
