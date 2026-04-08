import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, In } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import { Follower } from '../../followers/domain/entities/follower.entity';
import { ShortLinksService } from '../../short-links/services/short-links.service';
import { UrlService } from '../../../common/services/url.service';
import { FileUtils } from '../../../common/utils/file.utils';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Follower)
    private followersRepository: Repository<Follower>,
    private shortLinksService: ShortLinksService,
    private urlService: UrlService,
  ) {}

  private async formatUserUrls(user: User): Promise<User> {
    const formattedUser = this.urlService.formatUserUrls(user);
    const shortLink = await this.shortLinksService.getOrCreateShortLink(user.id);
    (formattedUser as any).shareUrl = this.shortLinksService.getFullUrl(shortLink.code);
    return formattedUser;
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return Promise.all(users.map((user) => this.formatUserUrls(user)));
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? this.formatUserUrls(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user ? this.formatUserUrls(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ? this.formatUserUrls(user) : null;
  }

  async searchByUsername(query: string): Promise<User[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    const users = await this.usersRepository.find({
      where: { username: Like(`%${query}%`) },
      take: 20,
      select: ['id', 'username', 'fullName', 'profilePictureUrl', 'isPrivate'],
    });
    return Promise.all(users.map((user) => this.formatUserUrls(user)));
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.profilePictureUrl && userData.profilePictureUrl.startsWith('data:image')) {
      const savedUrl = FileUtils.saveBase64ImageSafe(userData.profilePictureUrl, 'avatars');
      if (savedUrl) {
        userData.profilePictureUrl = savedUrl;
      } else {
        throw new BadRequestException('Failed to save profile picture');
      }
    }
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    return this.formatUserUrls(savedUser);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    if (userData.profilePictureUrl && userData.profilePictureUrl.startsWith('data:image')) {
      const savedUrl = FileUtils.saveBase64ImageSafe(userData.profilePictureUrl, 'avatars');
      if (savedUrl) {
        userData.profilePictureUrl = savedUrl;
      } else {
        throw new BadRequestException('Failed to save profile picture');
      }
    }
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async getSuggestedUsers(userId: string, limit: number = 10): Promise<User[]> {
    const following = await this.followersRepository.find({
      where: { followerId: userId },
      select: ['followingId'],
    });
    const followingIds = following.map((f) => f.followingId);
    const excludeIds = [...followingIds, userId];

    const suggestedUsers = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('followers', 'f', 'f.followingId = user.id')
      .where('user.id NOT IN (:...excludeIds)', { excludeIds })
      .groupBy('user.id')
      .orderBy('COUNT(f.id)', 'DESC')
      .addOrderBy('user.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return Promise.all(suggestedUsers.map((user) => this.formatUserUrls(user)));
  }
}
