import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ timestamps: true, collection: 'settings' })
export class Settings extends Document {
  @Prop({ required: true, unique: true, default: 'app_settings' })
  key: string;

  @Prop({ default: 'Ash Transportation' })
  companyName: string;

  @Prop({ default: '' })
  companyAddress: string;

  @Prop({ default: '' })
  companyPhone: string;

  @Prop({ default: 4 })
  copiesPerPrint: number;

  @Prop({ default: 'ESCPOS', enum: ['ESCPOS', 'USB_RAW'] })
  printerType: string;

  @Prop({ default: '' })
  printerName: string;

  @Prop({ default: 80 })
  printerWidthMm: number;

  @Prop({ type: Object, default: {} })
  printerCalibration: Record<string, number>;

  createdAt: Date;
  updatedAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
