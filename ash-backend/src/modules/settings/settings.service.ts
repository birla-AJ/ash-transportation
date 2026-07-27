import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings, SettingsDocument } from './schemas/settings.schema';

const SETTINGS_KEY = 'app_settings';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
  ) {}

  async get(): Promise<SettingsDocument> {
    let settings = await this.settingsModel.findOne({ key: SETTINGS_KEY }).exec();
    if (!settings) {
      settings = await this.settingsModel.create({ key: SETTINGS_KEY });
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto): Promise<SettingsDocument> {
    const settings = await this.settingsModel
      .findOneAndUpdate({ key: SETTINGS_KEY }, dto, { new: true, upsert: true })
      .exec();
    return settings!;
  }
}
