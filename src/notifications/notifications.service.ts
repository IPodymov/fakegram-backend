import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    recipientId: number,
    actorId: number,
    type: NotificationType,
    resourceId?: number,
  ): Promise<Notification | null> {
    if (recipientId === actorId) return null;

    const notification = this.notificationsRepository.create({
      recipientId,
      actorId,
      type,
      resourceId,
    });
    return this.notificationsRepository.save(notification);
  }

  async findAll(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { recipientId: userId },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(userId: number, id: number): Promise<void> {
    await this.notificationsRepository.update({ id, recipientId: userId }, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update({ recipientId: userId }, { isRead: true });
  }
}
