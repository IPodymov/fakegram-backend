/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface UserWithoutPassword {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  website: string | null;
  isPrivate: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

export interface LoginResponse {
  access_token: string;
  user: UserWithoutPassword;
  requires2FA?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return this.excludePassword(user);
  }

  async login(user: UserWithoutPassword): Promise<LoginResponse> {
    const payload = {
      username: user.username,
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.usersService.create({
      username,
      email,
      passwordHash: hashedPassword,
      isPrivate: false,
    });

    return this.excludePassword(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersService.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      return null;
    }
    return this.excludePassword(user);
  }

  private excludePassword(user: User): UserWithoutPassword {
    const {
      passwordHash,
      twoFactorCode,
      twoFactorCodeExpiresAt,
      ...userWithoutPassword
    } = user;
    return userWithoutPassword as UserWithoutPassword;
  }

  // Генерация 6-значного кода для 2FA
  generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Отправка кода на email (заглушка - нужно интегрировать email-сервис)
  async sendVerificationCode(email: string, code: string): Promise<void> {
    // TODO: Интегрировать email-сервис (nodemailer, SendGrid, AWS SES и т.д.)
    console.log(`Sending verification code ${code} to ${email}`);
    // В продакшене здесь должна быть реальная отправка email
  }

  // Включение/выключение 2FA для пользователя
  async toggle2FA(
    userId: string,
    enable: boolean,
  ): Promise<{ message: string }> {
    await this.usersService.update(userId, { twoFactorEnabled: enable });
    return {
      message: enable
        ? '2FA enabled successfully'
        : '2FA disabled successfully',
    };
  }

  // Создание и отправка кода 2FA при логине
  async initiate2FA(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const code = this.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Код действителен 10 минут

    await this.usersService.update(user.id, {
      twoFactorCode: code,
      twoFactorCodeExpiresAt: expiresAt,
    });

    await this.sendVerificationCode(email, code);

    return { message: 'Verification code sent to your email' };
  }

  // Проверка кода 2FA
  async verify2FACode(email: string, code: string): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorCode || !user.twoFactorCodeExpiresAt) {
      throw new Error('No verification code found');
    }

    if (new Date() > user.twoFactorCodeExpiresAt) {
      throw new Error('Verification code expired');
    }

    if (user.twoFactorCode !== code) {
      throw new Error('Invalid verification code');
    }

    // Очистка кода после успешной верификации
    await this.usersService.update(user.id, {
      twoFactorCode: null,
      twoFactorCodeExpiresAt: null,
    });

    const userWithoutPassword = this.excludePassword(user);
    return this.login(userWithoutPassword);
  }
}
