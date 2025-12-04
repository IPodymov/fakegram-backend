import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Redirect,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ShortLinksService } from './short-links.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class ShortLinksController {
  constructor(private readonly shortLinksService: ShortLinksService) {}

  @Post('short-links')
  @UseGuards(JwtAuthGuard)
  async createShortLink(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<{
    code: string;
    shortUrl: string;
    createdAt: Date;
  }> {
    const shortLink = await this.shortLinksService.createShortLink(user.id);
    return {
      code: shortLink.code,
      shortUrl: this.shortLinksService.getFullUrl(shortLink.code),
      createdAt: shortLink.createdAt,
    };
  }

  @Get('short-links/me')
  @UseGuards(JwtAuthGuard)
  async getMyShortLink(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<{
    code: string;
    shortUrl: string;
    clickCount: number;
    createdAt: Date;
  } | null> {
    const stats = await this.shortLinksService.getStats(user.id);
    return stats;
  }

  @Get('s/:code')
  @Redirect()
  async redirectToProfile(@Param('code') code: string): Promise<{
    url: string;
    statusCode: number;
  }> {
    const shortLink = await this.shortLinksService.getByCode(code);

    if (!shortLink || !shortLink.user) {
      throw new HttpException('Short link not found', HttpStatus.NOT_FOUND);
    }

    // Редирект на профиль пользователя (можно изменить на фронтенд URL)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return {
      url: `${frontendUrl}/@${shortLink.user.username}`,
      statusCode: 302,
    };
  }

  @Delete('short-links')
  @UseGuards(JwtAuthGuard)
  async deleteShortLink(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<{ message: string }> {
    await this.shortLinksService.delete(user.id);
    return { message: 'Short link deleted successfully' };
  }
}
