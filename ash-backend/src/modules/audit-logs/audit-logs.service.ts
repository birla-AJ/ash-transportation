import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export type AuditAction =
  | 'CHALLAN_CREATE'
  | 'CHALLAN_UPDATE'
  | 'CHALLAN_DELETE'
  | 'CHALLAN_REPRINT'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'SUB_ADMIN_CREATED'
  | 'SUB_ADMIN_DELETED'
  | 'ADMIN_CREATED'
  | 'ADMIN_DELETED'
  | 'ADMIN_STATUS_CHANGED'
  | 'TRANSPORTER_CREATED'
  | 'TRANSPORTER_UPDATED'
  | 'TRANSPORTER_STATUS_CHANGED';

export interface CreateAuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  performedBy: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  reason?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: CreateAuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        performedBy: input.performedBy,
        before: input.before === undefined ? undefined : (input.before as Prisma.InputJsonValue),
        after: input.after === undefined ? undefined : (input.after as Prisma.InputJsonValue),
        reason: input.reason ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    });
  }

  async findAll(query: PaginationQueryDto & { entityType?: string; action?: string }) {
    const { page, limit, sortBy, sortOrder, search, entityType, action } = query;

    const where: Prisma.AuditLogWhereInput = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {
      [sortBy || 'createdAt']: sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { performedByUser: { select: { name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
