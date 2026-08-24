import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { PrismaService } from './prisma.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const config = app.get(ConfigService);
  const prisma = app.get(PrismaService);

  const adminEmail = (config.get<string>('admin.email') || '').toLowerCase();
  const adminPassword = config.get<string>('admin.password') as string;
  const adminName = config.get<string>('admin.name') as string;

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    // eslint-disable-next-line no-console
    console.log(`Admin user already exists: ${adminEmail}`);
  } else {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashed,
        role: 'admin',
        isActive: true,
      },
    });
    // eslint-disable-next-line no-console
    console.log(`Created admin user: ${adminEmail} / ${adminPassword}`);
    // eslint-disable-next-line no-console
    console.log('IMPORTANT: Change this password immediately after first login.');
  }

  const superAdminEmail = (config.get<string>('superAdmin.email') || '').toLowerCase();
  const superAdminPassword = config.get<string>('superAdmin.password') as string;
  const superAdminName = config.get<string>('superAdmin.name') as string;

  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (existingSuperAdmin) {
    // eslint-disable-next-line no-console
    console.log(`Super admin already exists: ${superAdminEmail}`);
  } else {
    const hashed = await bcrypt.hash(superAdminPassword, 10);
    await prisma.user.create({
      data: {
        name: superAdminName,
        email: superAdminEmail,
        password: hashed,
        role: 'super_admin',
        isActive: true,
      },
    });
    // eslint-disable-next-line no-console
    console.log(`Created super admin: ${superAdminEmail} / ${superAdminPassword}`);
  }

  const existingSettings = await prisma.settings.findUnique({ where: { key: 'app_settings' } });
  if (!existingSettings) {
    await prisma.settings.create({ data: { key: 'app_settings' } });
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
