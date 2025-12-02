/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import {
  AuthService,
  LoginResponse,
  UserWithoutPassword,
} from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponse | { message: string; requires2FA: boolean }> {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      if (!user) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Проверка, включена ли 2FA
      const fullUser = await this.authService.findByEmail(loginDto.email);
      if (fullUser?.twoFactorEnabled) {
        await this.authService.initiate2FA(loginDto.email);
        return {
          message: 'Verification code sent to your email',
          requires2FA: true,
        };
      }

      return this.authService.login(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-2fa')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verify2FA(@Body() verify2FADto: Verify2FADto): Promise<LoginResponse> {
    try {
      return await this.authService.verify2FACode(
        verify2FADto.email,
        verify2FADto.code,
      );
    } catch (error: any) {
      throw new HttpException(
        (error?.message as string) || 'Verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Patch('toggle-2fa')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async toggle2FA(
    @Request() req: any,
    @Body() enable2FADto: Enable2FADto,
  ): Promise<{ message: string }> {
    try {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */

      return await this.authService.toggle2FA(
        req.user.userId as string,
        enable2FADto.enable,
      );
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      /* eslint-enable @typescript-eslint/no-unsafe-return */
      /* eslint-enable @typescript-eslint/no-unsafe-call */
    } catch {
      throw new HttpException(
        'Failed to update 2FA settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string; user: UserWithoutPassword }> {
    try {
      // Проверка существующего username
      const existingUser = await this.authService.findByUsername(
        registerDto.username,
      );
      if (existingUser) {
        throw new HttpException('Username already exists', HttpStatus.CONFLICT);
      }

      // Проверка существующего email
      const existingEmail = await this.authService.findByEmail(
        registerDto.email,
      );
      if (existingEmail) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const result = await this.authService.register(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );

      return {
        message: 'User registered successfully',
        user: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
