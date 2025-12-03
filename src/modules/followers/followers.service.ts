import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from '../../entities/follower.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follower)
    private followersRepository: Repository<Follower>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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
    return this.followersRepository.save(follower);
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

    return followers.map((f) => f.follower);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const following = await this.followersRepository.find({
      where: { followerId: userId },
      relations: ['following'],
    });

    return following.map((f) => f.following);
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
