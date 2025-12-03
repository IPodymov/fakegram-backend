import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Story } from '../../entities/story.entity';
import { FileUtils } from '../../common/utils/file.utils';

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
    // Обрабатываем base64 изображение, если оно есть
    let mediaUrl = storyData.mediaUrl;
    if (mediaUrl && mediaUrl.startsWith('data:image')) {
      try {
        mediaUrl = FileUtils.saveBase64Image(mediaUrl, 'stories');
      } catch (error) {
        console.error('Error saving base64 image:', error);
        mediaUrl = null;
      }
    }

    const story = this.storiesRepository.create({
      ...storyData,
      mediaUrl,
      userId,
    });
    return this.storiesRepository.save(story);
  }

  async remove(id: string): Promise<void> {
    await this.storiesRepository.delete(id);
  }
}
