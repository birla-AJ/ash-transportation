import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

export type AuditAction =
  | 'CHALLAN_CREATE'
  | 'CHALLAN_UPDATE'
  | 'CHALLAN_DELETE'
  | 'CHALLAN_REPRINT'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATE'
  | 'USER_UPDATE';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true, index: true })
  action: AuditAction;

  @Prop({ required: true, index: true })
  entityType: string;

  @Prop({ type: Types.ObjectId, index: true, default: null })
  entityId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  performedBy: Types.ObjectId;

  @Prop({ type: Object, default: null })
  before: Record<string, unknown> | null;

  @Prop({ type: Object, default: null })
  after: Record<string, unknown> | null;

  @Prop({ default: null })
  reason: string | null;

  @Prop({ default: null })
  ipAddress: string | null;

  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
