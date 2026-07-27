import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ChallanDocument = HydratedDocument<Challan>;

@Schema({ timestamps: true })
export class Challan extends Document {
  @Prop({ required: true, unique: true, index: true })
  challanNumber: string;

  @Prop({ required: true })
  challanSequence: number;

  @Prop({ required: true, trim: true, uppercase: true, index: true })
  truckNumber: string;

  @Prop({ required: true, trim: true, index: true })
  placeOfDelivery: string;

  // Driver name reserved for future use - not required at creation
  @Prop({ trim: true, default: null })
  driverName: string | null;

  @Prop({ required: true, index: true })
  challanDate: Date;

  @Prop({ required: true })
  challanTime: string;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date | null;

  @Prop({ default: null })
  deletedReason: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  @Prop({ default: 0 })
  printCount: number;

  @Prop({ default: null })
  lastPrintedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ChallanSchema = SchemaFactory.createForClass(Challan);

// Compound text index for global search
ChallanSchema.index({ truckNumber: 'text', placeOfDelivery: 'text', challanNumber: 'text' });
