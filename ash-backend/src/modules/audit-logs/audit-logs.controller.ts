import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Roles('admin')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs with pagination and filters' })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
  ) {
    return this.auditLogsService.findAll({ ...query, entityType, action });
  }
}
