import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ReelHistory } from './entities/reel-history.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ReelHistory)
    private reelHistoryRepository: Repository<ReelHistory>,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
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
}
