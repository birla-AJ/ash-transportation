import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TransportersService } from './transporters.service';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { UpdateTransporterDto } from './dto/update-transporter.dto';
import { SetTransporterActiveDto } from './dto/set-transporter-active.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@ApiTags('Transporters')
@ApiBearerAuth()
@Controller('transporters')
export class TransportersController {
  constructor(
    private readonly transportersService: TransportersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  @Roles('admin', 'sub_admin')
  @ApiOperation({
    summary: 'List transporters (active only by default) — used by the Add Challan dropdown',
  })
  async findAll(@Query('all') all?: string) {
    // Admins only ever need active transporters for the dropdown. Sub Admins
    // pass ?all=true to see everything (including deactivated) in their
    // management table.
    return all === 'true' ? this.transportersService.findAll() : this.transportersService.findActive();
  }

  @Post()
  @Roles('sub_admin')
  @ApiOperation({ summary: 'Add a new transporter' })
  async create(@Body() dto: CreateTransporterDto, @CurrentUser('userId') userId: string) {
    const transporter = await this.transportersService.create(dto, userId);
    await this.auditLogsService.log({
      action: 'TRANSPORTER_CREATED',
      entityType: 'Transporter',
      entityId: transporter.id,
      performedBy: userId,
      after: transporter,
    });
    return transporter;
  }

  @Patch(':id')
  @Roles('sub_admin')
  @ApiOperation({ summary: "Edit a transporter's name, address, or challan design" })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransporterDto,
    @CurrentUser('userId') userId: string,
  ) {
    const transporter = await this.transportersService.update(id, dto);
    await this.auditLogsService.log({
      action: 'TRANSPORTER_UPDATED',
      entityType: 'Transporter',
      entityId: id,
      performedBy: userId,
      after: transporter,
    });
    return transporter;
  }

  @Patch(':id/status')
  @Roles('sub_admin')
  @ApiOperation({ summary: 'Activate or deactivate a transporter' })
  async setStatus(
    @Param('id') id: string,
    @Body() dto: SetTransporterActiveDto,
    @CurrentUser('userId') userId: string,
  ) {
    const transporter = await this.transportersService.setActive(id, dto.isActive);
    await this.auditLogsService.log({
      action: 'TRANSPORTER_STATUS_CHANGED',
      entityType: 'Transporter',
      entityId: id,
      performedBy: userId,
      after: { isActive: dto.isActive },
    });
    return transporter;
  }
}
