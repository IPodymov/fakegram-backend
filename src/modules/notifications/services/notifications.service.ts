import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Notification } from '../domain/entities/notification.entity';
import { UserFollowedEvent } from '../../followers/events/follower.events';
import { PostLikedEvent, CommentAddedEvent } from '../../posts/events/post.events';
import { UrlService } from '../../../common/services/url.service';

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
    const notification = this.notificationsRepository.create({ userId, type, message, referenceId });
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
    return notification ? this.urlService.formatNotificationUrls(notification) : null;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update({ userId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({ where: { userId, isRead: false } });
  }

  async delete(id: string): Promise<void> {
    await this.notificationsRepository.delete(id);
  }

  async deleteAll(userId: string): Promise<void> {
    await this.notificationsRepository.delete({ userId });
  }

  // Event listeners - decoupled from other modules

  @OnEvent('user.followed')
  async handleUserFollowed(event: UserFollowedEvent): Promise<void> {
    await this.create(
      event.followingId,
      NotificationType.FOLLOW,
      `${event.followerUsername} started following you`,
      event.followerId,
    );
  }

  @OnEvent('post.liked')
  async handlePostLiked(event: PostLikedEvent): Promise<void> {
    await this.create(
      event.postOwnerId,
      NotificationType.LIKE,
      `${event.likerUsername} liked your post`,
      event.postId,
    );
  }

  @OnEvent('comment.added')
  async handleCommentAdded(event: CommentAddedEvent): Promise<void> {
    await this.create(
      event.postOwnerId,
      NotificationType.COMMENT,
      `${event.commenterUsername} commented on your post`,
      event.postId,
    );
  }
}
