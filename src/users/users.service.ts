import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ReelHistory } from './entities/reel-history.entity';
import { Follow } from './entities/follow.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ReelHistory)
    private reelHistoryRepository: Repository<ReelHistory>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    private notificationsService: NotificationsService,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async getReelHistory(userId: number): Promise<ReelHistory[]> {
    return this.reelHistoryRepository.find({
      where: { userId },
      relations: ['reel', 'reel.author'],
      order: { watchedAt: 'DESC' },
    });
  }

  async follow(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const followingUser = await this.findById(followingId);
    if (!followingUser) {
      throw new NotFoundException('User not found');
    }

    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      return; // Already following
    }

    const follow = this.followRepository.create({
      followerId,
      followingId,
    });
    await this.followRepository.save(follow);

    await this.notificationsService.create(
      followingId,
      followerId,
      NotificationType.FOLLOW,
    );
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    await this.followRepository.delete({ followerId, followingId });
  }

  async getFollowers(userId: number): Promise<User[]> {
    const follows = await this.followRepository.find({
      where: { followingId: userId },
      relations: ['follower'],
    });
    return follows.map((f) => f.follower);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      relations: ['following'],
    });
    return follows.map((f) => f.following);
  }
}
