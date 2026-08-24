import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTransporterDto } from './dto/create-transporter.dto';

@Injectable()
export class TransportersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Active transporters only — this is what the Admin's Add Challan dropdown uses. */
  async findActive() {
    return this.prisma.transporter.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /** Every transporter (active + inactive) — for the Sub Admin's management list. */
  async findAll() {
    return this.prisma.transporter.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateTransporterDto, userId: string) {
    return this.prisma.transporter.create({
      data: { name: dto.name.trim(), address: dto.address.trim(), createdBy: userId },
    });
  }

  async setActive(id: string, isActive: boolean) {
    const existing = await this.prisma.transporter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Transporter not found');
    return this.prisma.transporter.update({ where: { id }, data: { isActive } });
  }
}
