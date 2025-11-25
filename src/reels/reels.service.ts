import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reel } from './entities/reel.entity';
import { CreateReelDto } from './dto/create-reel.dto';
import { ReelHistory } from '../users/entities/reel-history.entity';

@Injectable()
export class ReelsService {
  constructor(
    @InjectRepository(Reel)
    private reelsRepository: Repository<Reel>,
    @InjectRepository(ReelHistory)
    private reelHistoryRepository: Repository<ReelHistory>,
  ) {}

  async create(
    userId: number,
    createReelDto: CreateReelDto,
    file: Express.Multer.File,
  ): Promise<Reel> {
    const reel = this.reelsRepository.create({
      ...createReelDto,
      authorId: userId,
      videoUrl: `/uploads/${file.filename}`,
    });
    return this.reelsRepository.save(reel);
  }

  async findAll(): Promise<Reel[]> {
    return this.reelsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Reel | null> {
    return this.reelsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async markAsWatched(userId: number, reelId: number): Promise<ReelHistory> {
    const history = this.reelHistoryRepository.create({
      userId,
      reelId,
    });
    return this.reelHistoryRepository.save(history);
  }
}
