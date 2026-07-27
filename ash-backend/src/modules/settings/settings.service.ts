import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTINGS_KEY = 'app_settings';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    return this.prisma.settings.upsert({
      where: { key: SETTINGS_KEY },
      update: {},
      create: { key: SETTINGS_KEY },
    });
  }

  async update(dto: UpdateSettingsDto) {
    return this.prisma.settings.upsert({
      where: { key: SETTINGS_KEY },
      update: dto as Prisma.SettingsUpdateInput,
      create: { key: SETTINGS_KEY, ...dto } as Prisma.SettingsCreateInput,
    });
  }
}
