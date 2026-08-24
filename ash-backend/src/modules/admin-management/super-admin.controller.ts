import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

/**
 * Everything a Super Admin is allowed to do: see the list of Sub Admins,
 * add one, remove one. Nothing else lives behind this role on purpose.
 */
@ApiTags('Super Admin')
@ApiBearerAuth()
@Controller('super-admin')
@Roles('super_admin')
export class SuperAdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get('sub-admins')
  @ApiOperation({ summary: 'List all Sub Admins' })
  async listSubAdmins() {
    return this.usersService.findAllByRole('sub_admin');
  }

  @Post('sub-admins')
  @ApiOperation({ summary: 'Create a new Sub Admin' })
  async createSubAdmin(@Body() dto: CreateUserDto, @CurrentUser('userId') userId: string) {
    const subAdmin = await this.usersService.createWithRole(dto, 'sub_admin');
    await this.auditLogsService.log({
      action: 'SUB_ADMIN_CREATED',
      entityType: 'User',
      entityId: subAdmin.id,
      performedBy: userId,
      after: { name: subAdmin.name, email: subAdmin.email },
    });
    return subAdmin;
  }

  @Delete('sub-admins/:id')
  @ApiOperation({ summary: 'Delete a Sub Admin' })
  async deleteSubAdmin(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    await this.usersService.deleteByIdAndRole(id, 'sub_admin');
    await this.auditLogsService.log({
      action: 'SUB_ADMIN_DELETED',
      entityType: 'User',
      entityId: id,
      performedBy: userId,
    });
    return { message: 'Sub Admin deleted successfully' };
  }
}
