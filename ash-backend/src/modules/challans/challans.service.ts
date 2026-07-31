import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { resolveDateRange } from '../../common/utils/date-range.util';
import { formatIstTime24h } from '../../common/utils/ist-time.util';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateChallanDto } from './dto/create-challan.dto';
import { DeleteChallanDto } from './dto/delete-challan.dto';
import { QueryChallanDto } from './dto/query-challan.dto';
import { UpdateChallanDto } from './dto/update-challan.dto';

const USER_SELECT = { select: { id: true, name: true, email: true } };

@Injectable()
export class ChallansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Atomically increments and returns the next challan sequence number via
   * a single upsert (ON CONFLICT DO UPDATE under the hood) — safe under
   * concurrent requests. Deletes never decrement it, so a number is never
   * reused.
   */
  private async nextSequence(): Promise<number> {
    const counter = await this.prisma.challanCounter.upsert({
      where: { key: 'challan_sequence' },
      update: { sequence: { increment: 1 } },
      create: { key: 'challan_sequence', sequence: 1 },
    });
    return counter.sequence;
  }

  private formatChallanNumber(sequence: number): string {
    return sequence.toString();
  }

  private buildWhere(
    q: Partial<QueryChallanDto>,
  ): Prisma.ChallanWhereInput {
    const { search, challanNumber, truckNumber, placeOfDelivery, duration, startDate, endDate, includeDeleted } = q;

    const where: Prisma.ChallanWhereInput = {};
    if (!includeDeleted) where.isDeleted = false;

    if (challanNumber) where.challanNumber = { contains: challanNumber, mode: 'insensitive' };
    if (truckNumber) where.truckNumber = { contains: truckNumber, mode: 'insensitive' };
    if (placeOfDelivery) where.placeOfDelivery = { contains: placeOfDelivery, mode: 'insensitive' };

    const range = resolveDateRange(duration, startDate, endDate);
    if (range) {
      where.challanDate = { gte: range.start, lte: range.end };
    }

    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { truckNumber: { contains: search, mode: 'insensitive' } },
        { placeOfDelivery: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async create(dto: CreateChallanDto, userId: string) {
    const sequence = await this.nextSequence();
    const now = new Date();

    const saved = await this.prisma.challan.create({
      data: {
        challanNumber: this.formatChallanNumber(sequence),
        challanSequence: sequence,
        truckNumber: dto.truckNumber.trim(),
        placeOfDelivery: dto.placeOfDelivery.trim(),
        challanDate: now,
        challanTime: formatIstTime24h(now),
        createdBy: userId,
      },
      include: { createdByUser: USER_SELECT },
    });

    await this.auditLogsService.log({
      action: 'CHALLAN_CREATE',
      entityType: 'Challan',
      entityId: saved.id,
      performedBy: userId,
      after: saved,
    });

    return saved;
  }

  async findAll(query: QueryChallanDto) {
    const { page, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);
    const orderBy: Prisma.ChallanOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.challan.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { createdByUser: USER_SELECT, updatedByUser: USER_SELECT },
      }),
      this.prisma.challan.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllRaw(query: Omit<QueryChallanDto, 'page' | 'limit'>) {
    const where = this.buildWhere(query);
    const orderBy: Prisma.ChallanOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

    return this.prisma.challan.findMany({ where, orderBy });
  }

  async findOne(id: string) {
    const challan = await this.prisma.challan.findUnique({
      where: { id },
      include: { createdByUser: USER_SELECT, updatedByUser: USER_SELECT },
    });
    if (!challan) throw new NotFoundException('Challan not found');
    return challan;
  }

  async update(id: string, dto: UpdateChallanDto, userId: string) {
    const before = await this.findOne(id);
    if (before.isDeleted) {
      throw new BadRequestException('Cannot edit a deleted challan');
    }

    const saved = await this.prisma.challan.update({
      where: { id },
      data: {
        ...(dto.truckNumber !== undefined && { truckNumber: dto.truckNumber.trim() }),
        ...(dto.placeOfDelivery !== undefined && { placeOfDelivery: dto.placeOfDelivery.trim() }),
        ...(dto.challanDate !== undefined && { challanDate: new Date(dto.challanDate) }),
        ...(dto.challanTime !== undefined && { challanTime: dto.challanTime }),
        updatedBy: userId,
      },
      include: { createdByUser: USER_SELECT, updatedByUser: USER_SELECT },
    });

    await this.auditLogsService.log({
      action: 'CHALLAN_UPDATE',
      entityType: 'Challan',
      entityId: saved.id,
      performedBy: userId,
      before,
      after: saved,
    });

    return saved;
  }

  async remove(id: string, dto: DeleteChallanDto, userId: string): Promise<void> {
    const before = await this.findOne(id);
    if (before.isDeleted) {
      throw new BadRequestException('Challan is already deleted');
    }

    // Note: challanNumber / challanSequence are intentionally left untouched
    // and the sequence counter is never decremented, so this number can
    // never be reused by a future challan.
    await this.prisma.challan.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedReason: dto.reason,
        deletedBy: userId,
      },
    });

    await this.auditLogsService.log({
      action: 'CHALLAN_DELETE',
      entityType: 'Challan',
      entityId: before.id,
      performedBy: userId,
      before,
      reason: dto.reason,
    });
  }

  async registerPrint(id: string, userId: string) {
    const existing = await this.findOne(id);
    const challan = await this.prisma.challan.update({
      where: { id },
      data: { printCount: existing.printCount + 1, lastPrintedAt: new Date() },
      include: { createdByUser: USER_SELECT },
    });

    await this.auditLogsService.log({
      action: 'CHALLAN_REPRINT',
      entityType: 'Challan',
      entityId: challan.id,
      performedBy: userId,
      after: { printCount: challan.printCount },
    });

    return challan;
  }

  async dashboardStats() {
    const todayRange = resolveDateRange('today')!;
    const monthRange = resolveDateRange('month')!;
    const yearRange = resolveDateRange('year')!;

    const baseWhere: Prisma.ChallanWhereInput = { isDeleted: false };

    const [todayCount, monthCount, yearCount, recentChallans, recentAudit] = await Promise.all([
      this.prisma.challan.count({
        where: { ...baseWhere, challanDate: { gte: todayRange.start, lte: todayRange.end } },
      }),
      this.prisma.challan.count({
        where: { ...baseWhere, challanDate: { gte: monthRange.start, lte: monthRange.end } },
      }),
      this.prisma.challan.count({
        where: { ...baseWhere, challanDate: { gte: yearRange.start, lte: yearRange.end } },
      }),
      this.prisma.challan.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { createdByUser: { select: { name: true } } },
      }),
      this.prisma.challan.findMany({
        where: baseWhere,
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: { createdByUser: { select: { name: true } }, updatedByUser: { select: { name: true } } },
      }),
    ]);

    return {
      todayTrips: todayCount,
      todayChallans: todayCount,
      monthlyTrips: monthCount,
      yearlyTrips: yearCount,
      recentChallans,
      latestActivity: recentAudit,
    };
  }
}
