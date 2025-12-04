import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from '../../entities/notification.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все уведомления', description: 'Получить список всех уведомлений текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Список уведомлений' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  findAll(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<Notification[]> {
    return this.notificationsService.findByUserId(user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Получить непрочитанные уведомления', description: 'Получить только непрочитанные уведомления' })
  @ApiResponse({ status: 200, description: 'Список непрочитанных уведомлений' })
  findUnread(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<Notification[]> {
    return this.notificationsService.findUnreadByUserId(user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Количество непрочитанных', description: 'Получить количество непрочитанных уведомлений' })
  @ApiResponse({ status: 200, description: 'Количество непрочитанных уведомлений' })
  getUnreadCount(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<{ count: number }> {
    return this.notificationsService
      .getUnreadCount(user.id)
      .then((count) => ({ count }));
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Пометить как прочитанное', description: 'Пометить уведомление как прочитанное' })
  @ApiParam({ name: 'id', description: 'ID уведомления' })
  @ApiResponse({ status: 200, description: 'Уведомление помечено как прочитанное' })
  markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  markAllAsRead(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<{ message: string }> {
    return this.notificationsService
      .markAllAsRead(user.id)
      .then(() => ({ message: 'All notifications marked as read' }));
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.notificationsService
      .delete(id)
      .then(() => ({ message: 'Notification deleted' }));
  }

  @Delete()
  deleteAll(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<{ message: string }> {
    return this.notificationsService
      .deleteAll(user.id)
      .then(() => ({ message: 'All notifications deleted' }));
  }
}
