import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { resolveDateRange } from '../../common/utils/date-range.util';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ChallanCounter, ChallanCounterDocument } from './schemas/challan-counter.schema';
import { Challan, ChallanDocument } from './schemas/challan.schema';
import { CreateChallanDto } from './dto/create-challan.dto';
import { DeleteChallanDto } from './dto/delete-challan.dto';
import { QueryChallanDto } from './dto/query-challan.dto';
import { UpdateChallanDto } from './dto/update-challan.dto';

@Injectable()
export class ChallansService {
  constructor(
    @InjectModel(Challan.name) private challanModel: Model<ChallanDocument>,
    @InjectModel(ChallanCounter.name) private counterModel: Model<ChallanCounterDocument>,
    private readonly config: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Atomically increments and returns the next challan sequence number.
   * Because this only ever increments (deletes never decrement it),
   * a challan number is never reused, even after deletion.
   */
  private async nextSequence(): Promise<number> {
    const counter = await this.counterModel
      .findOneAndUpdate(
        { key: 'challan_sequence' },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true },
      )
      .exec();
    return counter.sequence;
  }

  private formatChallanNumber(sequence: number): string {
    const prefix = this.config.get<string>('challan.prefix') || 'ASH';
    const padLength = this.config.get<number>('challan.padLength') || 6;
    return `${prefix}-${String(sequence).padStart(padLength, '0')}`;
  }

  async create(dto: CreateChallanDto, userId: string): Promise<ChallanDocument> {
    const sequence = await this.nextSequence();
    const now = new Date();

    const challan = new this.challanModel({
      challanNumber: this.formatChallanNumber(sequence),
      challanSequence: sequence,
      truckNumber: dto.truckNumber.trim(),
      placeOfDelivery: dto.placeOfDelivery.trim(),
      challanDate: now,
      challanTime: now.toTimeString().slice(0, 5),
      createdBy: new Types.ObjectId(userId),
    });

    const saved = await challan.save();

    await this.auditLogsService.log({
      action: 'CHALLAN_CREATE',
      entityType: 'Challan',
      entityId: saved._id,
      performedBy: userId,
      after: saved.toObject(),
    });

    return saved;
  }

  async findAll(query: QueryChallanDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      challanNumber,
      truckNumber,
      placeOfDelivery,
      duration,
      startDate,
      endDate,
      includeDeleted,
    } = query;

    const filter: Record<string, unknown> = {};
    if (!includeDeleted) filter.isDeleted = false;

    if (challanNumber) filter.challanNumber = { $regex: challanNumber, $options: 'i' };
    if (truckNumber) filter.truckNumber = { $regex: truckNumber, $options: 'i' };
    if (placeOfDelivery) filter.placeOfDelivery = { $regex: placeOfDelivery, $options: 'i' };

    const range = resolveDateRange(duration, startDate, endDate);
    if (range) {
      filter.challanDate = { $gte: range.start, $lte: range.end };
    }

    if (search) {
      filter.$or = [
        { challanNumber: { $regex: search, $options: 'i' } },
        { truckNumber: { $regex: search, $options: 'i' } },
        { placeOfDelivery: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
      : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.challanModel
        .find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.challanModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllRaw(query: Omit<QueryChallanDto, 'page' | 'limit'>) {
    const { search, challanNumber, truckNumber, placeOfDelivery, duration, startDate, endDate, includeDeleted, sortBy, sortOrder } =
      query;

    const filter: Record<string, unknown> = {};
    if (!includeDeleted) filter.isDeleted = false;
    if (challanNumber) filter.challanNumber = { $regex: challanNumber, $options: 'i' };
    if (truckNumber) filter.truckNumber = { $regex: truckNumber, $options: 'i' };
    if (placeOfDelivery) filter.placeOfDelivery = { $regex: placeOfDelivery, $options: 'i' };

    const range = resolveDateRange(duration, startDate, endDate);
    if (range) filter.challanDate = { $gte: range.start, $lte: range.end };

    if (search) {
      filter.$or = [
        { challanNumber: { $regex: search, $options: 'i' } },
        { truckNumber: { $regex: search, $options: 'i' } },
        { placeOfDelivery: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
      : { createdAt: -1 };

    return this.challanModel.find(filter).sort(sort).exec();
  }

  async findOne(id: string): Promise<ChallanDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Challan not found');
    const challan = await this.challanModel
      .findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .exec();
    if (!challan) throw new NotFoundException('Challan not found');
    return challan;
  }

  async update(id: string, dto: UpdateChallanDto, userId: string): Promise<ChallanDocument> {
    const challan = await this.findOne(id);
    if (challan.isDeleted) {
      throw new BadRequestException('Cannot edit a deleted challan');
    }

    const before = challan.toObject();

    if (dto.truckNumber !== undefined) challan.truckNumber = dto.truckNumber.trim();
    if (dto.placeOfDelivery !== undefined) challan.placeOfDelivery = dto.placeOfDelivery.trim();
    if (dto.challanDate !== undefined) challan.challanDate = new Date(dto.challanDate);
    if (dto.challanTime !== undefined) challan.challanTime = dto.challanTime;
    challan.updatedBy = new Types.ObjectId(userId);

    const saved = await challan.save();

    await this.auditLogsService.log({
      action: 'CHALLAN_UPDATE',
      entityType: 'Challan',
      entityId: saved._id,
      performedBy: userId,
      before,
      after: saved.toObject(),
    });

    return saved;
  }

  async remove(id: string, dto: DeleteChallanDto, userId: string): Promise<void> {
    const challan = await this.findOne(id);
    if (challan.isDeleted) {
      throw new BadRequestException('Challan is already deleted');
    }

    const before = challan.toObject();

    challan.isDeleted = true;
    challan.deletedAt = new Date();
    challan.deletedReason = dto.reason;
    challan.deletedBy = new Types.ObjectId(userId);
    await challan.save();

    // Note: challanNumber / challanSequence are intentionally left untouched
    // and the sequence counter is never decremented, so this number can
    // never be reused by a future challan.

    await this.auditLogsService.log({
      action: 'CHALLAN_DELETE',
      entityType: 'Challan',
      entityId: challan._id,
      performedBy: userId,
      before,
      reason: dto.reason,
    });
  }

  async registerPrint(id: string, userId: string): Promise<ChallanDocument> {
    const challan = await this.findOne(id);
    challan.printCount += 1;
    challan.lastPrintedAt = new Date();
    await challan.save();

    await this.auditLogsService.log({
      action: 'CHALLAN_REPRINT',
      entityType: 'Challan',
      entityId: challan._id,
      performedBy: userId,
      after: { printCount: challan.printCount },
    });

    return challan;
  }

  async dashboardStats() {
    const now = new Date();
    const todayRange = resolveDateRange('today')!;
    const weekRange = resolveDateRange('week')!;
    const monthRange = resolveDateRange('month')!;
    const yearRange = resolveDateRange('year')!;

    const baseFilter = { isDeleted: false };

    const [todayCount, monthCount, yearCount, recentChallans, recentAudit] = await Promise.all([
      this.challanModel.countDocuments({
        ...baseFilter,
        challanDate: { $gte: todayRange.start, $lte: todayRange.end },
      }),
      this.challanModel.countDocuments({
        ...baseFilter,
        challanDate: { $gte: monthRange.start, $lte: monthRange.end },
      }),
      this.challanModel.countDocuments({
        ...baseFilter,
        challanDate: { $gte: yearRange.start, $lte: yearRange.end },
      }),
      this.challanModel
        .find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('createdBy', 'name')
        .exec(),
      this.challanModel
        .find(baseFilter)
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .exec(),
    ]);

    void weekRange;
    void now;

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
