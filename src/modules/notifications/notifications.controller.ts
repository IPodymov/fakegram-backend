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

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<Notification[]> {
    return this.notificationsService.findByUserId(user.id);
  }

  @Get('unread')
  findUnread(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<Notification[]> {
    return this.notificationsService.findUnreadByUserId(user.id);
  }

  @Get('unread-count')
  getUnreadCount(
    @CurrentUser() user: { id: string; username: string },
  ): Promise<{ count: number }> {
    return this.notificationsService
      .getUnreadCount(user.id)
      .then((count) => ({ count }));
  }

  @Patch(':id/read')
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
