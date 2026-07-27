import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { LoginDto } from './dto/login.dto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid email or password');

    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    const tokens = await this.issueTokens(
      user.id,
      user.email,
      user.role,
      dto.rememberMe,
    );

    await this.usersService.setLastLogin(user.id);
    await this.auditLogsService.log({
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      performedBy: user.id,
      ipAddress,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const valid = await this.usersService.hasRefreshTokenHash(userId, tokenHash);
    if (!valid) throw new UnauthorizedException('Refresh token is invalid or has been revoked');

    await this.usersService.removeRefreshTokenHash(userId, tokenHash);

    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) throw new UnauthorizedException('User no longer active');

    return this.issueTokens(user.id, user.email, user.role, false);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.usersService.removeRefreshTokenHash(userId, hashToken(refreshToken));
    } else {
      await this.usersService.clearAllRefreshTokens(userId);
    }
    await this.auditLogsService.log({
      action: 'USER_LOGOUT',
      entityType: 'User',
      entityId: userId,
      performedBy: userId,
    });
    return { message: 'Logged out successfully' };
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    rememberMe = false,
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
    });

    const refreshExpiresIn = rememberMe
      ? this.config.get<string>('jwt.refreshExpiresInRemember')
      : this.config.get<string>('jwt.refreshExpiresIn');

    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: refreshExpiresIn,
      },
    );

    await this.usersService.addRefreshTokenHash(userId, hashToken(refreshToken));

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
    };
  }
}
