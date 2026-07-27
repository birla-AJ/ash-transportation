import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type ChallanCounterDocument = HydratedDocument<ChallanCounter>;

/**
 * Single-document counter used with findOneAndUpdate($inc) to atomically
 * generate strictly increasing challan sequence numbers. Because the
 * sequence only ever increments and is never decremented on delete,
 * deleted challan numbers are never reused.
 */
@Schema({ collection: 'challan_counters' })
export class ChallanCounter extends Document {
  @Prop({ required: true, unique: true, default: 'challan_sequence' })
  key: string;

  @Prop({ required: true, default: 0 })
  sequence: number;
}

export const ChallanCounterSchema = SchemaFactory.createForClass(ChallanCounter);
