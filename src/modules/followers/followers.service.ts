import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Follower } from '../../entities/follower.entity';
import { User } from '../../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowersService {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Follower)
    private followersRepository: Repository<Follower>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  private formatUserUrls(user: User): User {
    if (user.profilePictureUrl && !user.profilePictureUrl.startsWith('http')) {
      user.profilePictureUrl = `${this.baseUrl}${user.profilePictureUrl}`;
    }
    return user;
  }

  async follow(followerId: string, followingId: string): Promise<Follower> {
    // Проверка что пользователь не подписывается сам на себя
    if (followerId === followingId) {
      throw new HttpException('Cannot follow yourself', HttpStatus.BAD_REQUEST);
    }

    // Проверка существования пользователя
    const userToFollow = await this.usersRepository.findOne({
      where: { id: followingId },
    });
    if (!userToFollow) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Получаем информацию о подписчике
    const followerUser = await this.usersRepository.findOne({
      where: { id: followerId },
    });

    // Проверка существующей подписки
    const existingFollow = await this.followersRepository.findOne({
      where: { followerId, followingId },
    });
    if (existingFollow) {
      throw new HttpException(
        'Already following this user',
        HttpStatus.CONFLICT,
      );
    }

    const follower = this.followersRepository.create({
      followerId,
      followingId,
    });
    const savedFollower = await this.followersRepository.save(follower);

    // Создаем уведомление о новом подписчике
    if (followerUser) {
      await this.notificationsService.createFollowNotification(
        followingId,
        followerUser.username,
        followerId,
      );
    }

    return savedFollower;
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const follower = await this.followersRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follower) {
      throw new HttpException('Not following this user', HttpStatus.NOT_FOUND);
    }

    await this.followersRepository.delete(follower.id);
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followers = await this.followersRepository.find({
      where: { followingId: userId },
      relations: ['follower'],
    });

    return followers.map((f) => {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        passwordHash: _passwordHash,
        twoFactorCode: _twoFactorCode,
        twoFactorCodeExpiresAt: _twoFactorCodeExpiresAt,
        ...user
      } = f.follower;
      /* eslint-enable @typescript-eslint/no-unused-vars */
      return this.formatUserUrls(user as User);
    });
  }

  async getFollowing(userId: string): Promise<User[]> {
    const following = await this.followersRepository.find({
      where: { followerId: userId },
      relations: ['following'],
    });

    return following.map((f) => {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        passwordHash: _passwordHash,
        twoFactorCode: _twoFactorCode,
        twoFactorCodeExpiresAt: _twoFactorCodeExpiresAt,
        ...user
      } = f.following;
      /* eslint-enable @typescript-eslint/no-unused-vars */
      return this.formatUserUrls(user as User);
    });
  }

  async isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<{ isFollowing: boolean }> {
    const follower = await this.followersRepository.findOne({
      where: { followerId, followingId },
    });

    return { isFollowing: !!follower };
  }

  async getFollowerCount(userId: string): Promise<number> {
    return this.followersRepository.count({
      where: { followingId: userId },
    });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.followersRepository.count({
      where: { followerId: userId },
    });
  }
}
