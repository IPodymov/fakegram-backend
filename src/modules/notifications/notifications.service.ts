import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { UrlService } from '../../common/services/url.service';

export enum NotificationType {
  LIKE = 'like',
  FOLLOW = 'follow',
  COMMENT = 'comment',
  NEW_POST = 'new_post',
  MENTION = 'mention',
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private urlService: UrlService,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    message: string,
    referenceId?: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      type,
      message,
      referenceId,
    });
    return this.notificationsRepository.save(notification);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.notificationsRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return notifications.map((n) => this.urlService.formatNotificationUrls(n));
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.notificationsRepository.find({
      where: { userId, isRead: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return notifications.map((n) => this.urlService.formatNotificationUrls(n));
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.notificationsRepository.update(id, { isRead: true });
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return notification
      ? this.urlService.formatNotificationUrls(notification)
      : null;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string): Promise<void> {
    await this.notificationsRepository.delete(id);
  }

  async deleteAll(userId: string): Promise<void> {
    await this.notificationsRepository.delete({ userId });
  }

  // Вспомогательные методы для создания уведомлений

  async createLikeNotification(
    postOwnerId: string,
    likerUsername: string,
    postId: string,
  ): Promise<Notification> {
    return this.create(
      postOwnerId,
      NotificationType.LIKE,
      `${likerUsername} liked your post`,
      postId,
    );
  }

  async createFollowNotification(
    userId: string,
    followerUsername: string,
    followerId: string,
  ): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.FOLLOW,
      `${followerUsername} started following you`,
      followerId,
    );
  }

  async createCommentNotification(
    postOwnerId: string,
    commenterUsername: string,
    postId: string,
  ): Promise<Notification> {
    return this.create(
      postOwnerId,
      NotificationType.COMMENT,
      `${commenterUsername} commented on your post`,
      postId,
    );
  }

  async createNewPostNotification(
    userId: string,
    authorUsername: string,
    postId: string,
  ): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.NEW_POST,
      `${authorUsername} shared a new post`,
      postId,
    );
  }

  async createMentionNotification(
    userId: string,
    mentionerUsername: string,
    postId: string,
  ): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.MENTION,
      `${mentionerUsername} mentioned you in a post`,
      postId,
    );
  }
}
