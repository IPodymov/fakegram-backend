import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ShortLink } from '../../entities/short-link.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class ShortLinksService {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(ShortLink)
    private shortLinksRepository: Repository<ShortLink>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  private generateCode(length: number = 8): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  async createShortLink(userId: string): Promise<ShortLink> {
    // Проверяем существование пользователя
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Проверяем, есть ли уже короткая ссылка для этого пользователя
    const existing = await this.shortLinksRepository.findOne({
      where: { userId },
    });
    if (existing) {
      return existing;
    }

    // Генерируем уникальный код
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = this.generateCode();
      const existingCode = await this.shortLinksRepository.findOne({
        where: { code },
      });
      if (!existingCode) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new HttpException(
        'Failed to generate unique code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const shortLink = this.shortLinksRepository.create({
      code,
      userId,
    });

    return this.shortLinksRepository.save(shortLink);
  }

  async getOrCreateShortLink(userId: string): Promise<ShortLink> {
    // Проверяем, есть ли уже короткая ссылка
    const existing = await this.shortLinksRepository.findOne({
      where: { userId },
    });
    
    if (existing) {
      return existing;
    }

    // Создаем новую, если не существует
    return this.createShortLink(userId);
  }

  async getByCode(code: string): Promise<ShortLink | null> {
    const shortLink = await this.shortLinksRepository.findOne({
      where: { code },
      relations: ['user'],
    });

    if (shortLink) {
      // Увеличиваем счетчик кликов
      await this.shortLinksRepository.increment(
        { id: shortLink.id },
        'clickCount',
        1,
      );
    }

    return shortLink;
  }

  async getByUserId(userId: string): Promise<ShortLink | null> {
    return this.shortLinksRepository.findOne({
      where: { userId },
    });
  }

  getFullUrl(code: string): string {
    return `${this.baseUrl}/s/${code}`;
  }

  async delete(userId: string): Promise<void> {
    await this.shortLinksRepository.delete({ userId });
  }

  async getStats(userId: string): Promise<{
    code: string;
    clickCount: number;
    createdAt: Date;
    shortUrl: string;
  } | null> {
    const shortLink = await this.shortLinksRepository.findOne({
      where: { userId },
    });

    if (!shortLink) {
      return null;
    }

    return {
      code: shortLink.code,
      clickCount: shortLink.clickCount,
      createdAt: shortLink.createdAt,
      shortUrl: this.getFullUrl(shortLink.code),
    };
  }
}
