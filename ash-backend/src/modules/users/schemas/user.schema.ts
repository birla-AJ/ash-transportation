import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'admin', enum: ['admin'] })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastLoginAt: Date | null;

  @Prop({ type: [String], default: [], select: false })
  refreshTokenHashes: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
