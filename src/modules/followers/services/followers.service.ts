import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Follower } from '../domain/entities/follower.entity';
import { User } from '../../users/domain/entities/user.entity';
import { UserFollowedEvent, UserUnfollowedEvent } from '../events/follower.events';
import { UrlService } from '../../../common/services/url.service';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follower)
    private followersRepository: Repository<Follower>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
    private urlService: UrlService,
  ) {}

  async follow(followerId: string, followingId: string): Promise<Follower> {
    if (followerId === followingId) {
      throw new HttpException('Cannot follow yourself', HttpStatus.BAD_REQUEST);
    }
    const userToFollow = await this.usersRepository.findOne({ where: { id: followingId } });
    if (!userToFollow) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const followerUser = await this.usersRepository.findOne({ where: { id: followerId } });
    const existingFollow = await this.followersRepository.findOne({ where: { followerId, followingId } });
    if (existingFollow) {
      throw new HttpException('Already following this user', HttpStatus.CONFLICT);
    }

    const follower = this.followersRepository.create({ followerId, followingId });
    const savedFollower = await this.followersRepository.save(follower);

    if (followerUser) {
      this.eventEmitter.emit(
        'user.followed',
        new UserFollowedEvent(followerId, followerUser.username, followingId),
      );
    }

    return savedFollower;
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const follower = await this.followersRepository.findOne({ where: { followerId, followingId } });
    if (!follower) {
      throw new HttpException('Not following this user', HttpStatus.NOT_FOUND);
    }
    await this.followersRepository.delete(follower.id);
    this.eventEmitter.emit('user.unfollowed', new UserUnfollowedEvent(followerId, followingId));
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followers = await this.followersRepository.find({
      where: { followingId: userId },
      relations: ['follower'],
    });
    return followers.map((f) => this.urlService.formatUserUrls(f.follower));
  }

  async getFollowing(userId: string): Promise<User[]> {
    const following = await this.followersRepository.find({
      where: { followerId: userId },
      relations: ['following'],
    });
    return following.map((f) => this.urlService.formatUserUrls(f.following));
  }

  async isFollowing(followerId: string, followingId: string): Promise<{ isFollowing: boolean }> {
    const follower = await this.followersRepository.findOne({ where: { followerId, followingId } });
    return { isFollowing: !!follower };
  }

  async getFollowerCount(userId: string): Promise<number> {
    return this.followersRepository.count({ where: { followingId: userId } });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.followersRepository.count({ where: { followerId: userId } });
  }
}
