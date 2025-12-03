import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Story } from '../../entities/story.entity';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private storiesRepository: Repository<Story>,
  ) {}

  async findAll(): Promise<Story[]> {
    return this.storiesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Story | null> {
    return this.storiesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Story[]> {
    return this.storiesRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(storyData: Partial<Story>, userId: string): Promise<Story> {
    const story = this.storiesRepository.create({
      ...storyData,
      userId,
    });
    return this.storiesRepository.save(story);
  }

  async remove(id: string): Promise<void> {
    await this.storiesRepository.delete(id);
  }
}
