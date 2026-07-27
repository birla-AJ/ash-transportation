import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuditAction, AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface CreateAuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId?: string | Types.ObjectId | null;
  performedBy: string | Types.ObjectId;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  reason?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(input: CreateAuditLogInput): Promise<void> {
    await this.auditLogModel.create({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      performedBy: input.performedBy,
      before: input.before ?? null,
      after: input.after ?? null,
      reason: input.reason ?? null,
      ipAddress: input.ipAddress ?? null,
    });
  }

  async findAll(query: PaginationQueryDto & { entityType?: string; action?: string }) {
    const { page, limit, sortBy, sortOrder, search, entityType, action } = query;
    const filter: Record<string, unknown> = {};
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (search) {
      filter.$or = [
        { reason: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .populate('performedBy', 'name email')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
