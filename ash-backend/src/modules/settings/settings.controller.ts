import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get application settings (company info, printer config)' })
  async get() {
    return this.settingsService.get();
  }

  @Patch()
  @Roles('admin')
  @ApiOperation({ summary: 'Update application settings' })
  async update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
