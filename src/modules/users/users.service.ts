import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
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

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.formatUserUrls(user));
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
      where: {
        username: Like(`%${query}%`),
      },
      take: 20, // Ограничение результатов
      select: ['id', 'username', 'fullName', 'profilePictureUrl', 'isPrivate'],
    });
    return users.map((user) => this.formatUserUrls(user));
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    return this.formatUserUrls(savedUser);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
