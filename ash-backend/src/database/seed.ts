import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../modules/users/schemas/user.schema';
import { Settings } from '../modules/settings/schemas/settings.schema';
import { Model } from 'mongoose';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const config = app.get(ConfigService);
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const settingsModel = app.get<Model<Settings>>(getModelToken(Settings.name));

  const adminEmail = (config.get<string>('admin.email') || '').toLowerCase();
  const adminPassword = config.get<string>('admin.password') as string;
  const adminName = config.get<string>('admin.name') as string;

  const existingAdmin = await userModel.findOne({ email: adminEmail });
  if (existingAdmin) {
    // eslint-disable-next-line no-console
    console.log(`Admin user already exists: ${adminEmail}`);
  } else {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await userModel.create({
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: 'admin',
      isActive: true,
    });
    // eslint-disable-next-line no-console
    console.log(`Created admin user: ${adminEmail} / ${adminPassword}`);
    // eslint-disable-next-line no-console
    console.log('IMPORTANT: Change this password immediately after first login.');
  }

  const existingSettings = await settingsModel.findOne({ key: 'app_settings' });
  if (!existingSettings) {
    await settingsModel.create({ key: 'app_settings' });
    // eslint-disable-next-line no-console
    console.log('Created default application settings.');
  }

  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
