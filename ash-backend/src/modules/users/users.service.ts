import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const created = new this.userModel({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashed,
    });
    return created.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password +refreshTokenHashes')
      .exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(id).select('+password').exec();
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    user.refreshTokenHashes = [];
    await user.save();
  }

  async setLastLogin(id: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { lastLoginAt: new Date() }).exec();
  }

  async addRefreshTokenHash(id: string, tokenHash: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: id }, { $push: { refreshTokenHashes: { $each: [tokenHash], $slice: -10 } } })
      .exec();
  }

  async removeRefreshTokenHash(id: string, tokenHash: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: id }, { $pull: { refreshTokenHashes: tokenHash } })
      .exec();
  }

  async clearAllRefreshTokens(id: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { refreshTokenHashes: [] }).exec();
  }

  async hasRefreshTokenHash(id: string, tokenHash: string): Promise<boolean> {
    const user = await this.userModel.findById(id).select('+refreshTokenHashes').exec();
    return !!user?.refreshTokenHashes?.includes(tokenHash);
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }
}
