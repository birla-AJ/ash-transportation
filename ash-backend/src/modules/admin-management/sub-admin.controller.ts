import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { UsersService } from '../users/users.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ChallansService } from '../challans/challans.service';

/**
 * Everything a Sub Admin is allowed to do: fully manage Admin accounts
 * (the operational users who create challans) — add, delete, activate,
 * deactivate — plus a performance overview across all Admins.
 */
@ApiTags('Sub Admin')
@ApiBearerAuth()
@Controller('sub-admin')
@Roles('sub_admin')
export class SubAdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
    private readonly challansService: ChallansService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Total challans + per-admin challan counts, for the Sub Admin overview graphs',
  })
  async dashboard() {
    return this.challansService.adminPerformanceStats('admin');
  }

  @Get('admins')
  @ApiOperation({ summary: 'List all Admins' })
  async listAdmins() {
    return this.usersService.findAllByRole('admin');
  }

  @Post('admins')
  @ApiOperation({ summary: 'Create a new Admin' })
  async createAdmin(@Body() dto: CreateUserDto, @CurrentUser('userId') userId: string) {
    const admin = await this.usersService.createWithRole(dto, 'admin');
    await this.auditLogsService.log({
      action: 'ADMIN_CREATED',
      entityType: 'User',
      entityId: admin.id,
      performedBy: userId,
      after: { name: admin.name, email: admin.email },
    });
    return admin;
  }

  @Patch('admins/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate an Admin' })
  async setAdminStatus(
    @Param('id') id: string,
    @Body() dto: SetActiveDto,
    @CurrentUser('userId') userId: string,
  ) {
    const admin = await this.usersService.setActive(id, 'admin', dto.isActive);
    await this.auditLogsService.log({
      action: 'ADMIN_STATUS_CHANGED',
      entityType: 'User',
      entityId: id,
      performedBy: userId,
      after: { isActive: dto.isActive },
    });
    return admin;
  }

  @Delete('admins/:id')
  @ApiOperation({ summary: 'Delete an Admin' })
  async deleteAdmin(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    await this.usersService.deleteByIdAndRole(id, 'admin');
    await this.auditLogsService.log({
      action: 'ADMIN_DELETED',
      entityType: 'User',
      entityId: id,
      performedBy: userId,
    });
    return { message: 'Admin deleted successfully' };
  }
}
