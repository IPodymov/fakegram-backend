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

  private transformNotification(n: Notification): any {
    const { isRead, ...rest } = n as any;
    return { ...rest, read: isRead };
  }

  @Get()
  @ApiOperation({ summary: 'Получить все уведомления', description: 'Получить список всех уведомлений текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Список уведомлений' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  async findAll(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<any[]> {
    const notifications = await this.notificationsService.findByUserId(user.id);
    return notifications.map((n) => this.transformNotification(n));
  }

  @Get('unread')
  @ApiOperation({ summary: 'Получить непрочитанные уведомления', description: 'Получить только непрочитанные уведомления' })
  @ApiResponse({ status: 200, description: 'Список непрочитанных уведомлений' })
  async findUnread(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<any[]> {
    const notifications = await this.notificationsService.findUnreadByUserId(user.id);
    return notifications.map((n) => this.transformNotification(n));
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
  async markAsRead(@Param('id') id: string): Promise<any> {
    const notification = await this.notificationsService.markAsRead(id);
    return this.transformNotification(notification);
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
