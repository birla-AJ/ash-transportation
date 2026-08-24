import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { ...dto, email, password: hashed },
    });
    return this.stripPassword(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((u) => this.stripPassword(u));
  }

  /** Create a user pinned to a specific role, bypassing the schema's default. */
  async createWithRole(dto: CreateUserDto, role: string) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email, password: hashed, role },
    });
    return this.stripPassword(user);
  }

  /** List users of exactly one role, most recently created first. */
  async findAllByRole(role: string) {
    const users = await this.prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.stripPassword(u));
  }

  async setActive(id: string, role: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== role) {
      throw new NotFoundException('User not found');
    }
    const updated = await this.prisma.user.update({ where: { id }, data: { isActive } });
    return this.stripPassword(updated);
  }

  /**
   * Delete a user, scoped to an expected role so a sub admin can't be
   * deleted through the admin-deletion endpoint and vice versa.
   * Fails with a clear message if the user already has challans or audit
   * history attached (the DB foreign keys block a hard delete in that case)
   * — deactivating is the safe alternative for those accounts.
   */
  async deleteByIdAndRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== role) {
      throw new NotFoundException('User not found');
    }
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch {
      throw new ConflictException(
        'This user already has challans or activity linked to their account and cannot be deleted. Deactivate them instead.',
      );
    }
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.stripPassword(user) : null;
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({ where: { id }, data: dto });
      return this.stripPassword(user);
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed, refreshTokenHashes: [] },
    });
  }

  async setLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  async addRefreshTokenHash(id: string, tokenHash: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return;
    const updated = [...user.refreshTokenHashes, tokenHash].slice(-10);
    await this.prisma.user.update({ where: { id }, data: { refreshTokenHashes: updated } });
  }

  async removeRefreshTokenHash(id: string, tokenHash: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return;
    const updated = user.refreshTokenHashes.filter((h) => h !== tokenHash);
    await this.prisma.user.update({ where: { id }, data: { refreshTokenHashes: updated } });
  }

  async clearAllRefreshTokens(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { refreshTokenHashes: [] } });
  }

  async hasRefreshTokenHash(id: string, tokenHash: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return !!user?.refreshTokenHashes?.includes(tokenHash);
  }

  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  /** Never return the password hash to callers/controllers. */
  private stripPassword<T extends { password?: string }>(user: T): Omit<T, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }
}
