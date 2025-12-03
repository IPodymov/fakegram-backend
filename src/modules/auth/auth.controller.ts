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
  Res,
  Get,
} from '@nestjs/common';
import type { Response } from 'express';
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
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    try {
      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
      );

      if (!user) {
        throw new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const loginResponse = await this.authService.login(user);

      // Устанавливаем cookie с токеном
      res.cookie('access_token', loginResponse.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      });

      return loginResponse;
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
    @Res({ passthrough: true }) res: Response,
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

      // Автоматически логиним пользователя после регистрации
      const loginResponse = await this.authService.login(result);

      // Устанавливаем cookie с токеном
      res.cookie('access_token', loginResponse.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      });

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

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any): Promise<UserWithoutPassword> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId: string = req.user.id;
    const user = await this.authService.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
