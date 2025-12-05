import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Story } from '../../entities/story.entity';
import { FileUtils } from '../../common/utils/file.utils';
import { UrlService } from '../../common/services/url.service';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private storiesRepository: Repository<Story>,
    private urlService: UrlService,
  ) {}

  async findAll(): Promise<Story[]> {
    const stories = await this.storiesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return stories.map((story) => this.urlService.formatStoryUrls(story));
  }

  async findOne(id: string): Promise<Story | null> {
    const story = await this.storiesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return story ? this.urlService.formatStoryUrls(story) : null;
  }

  async findByUserId(userId: string): Promise<Story[]> {
    const stories = await this.storiesRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return stories.map((story) => this.urlService.formatStoryUrls(story));
  }

  async create(storyData: Partial<Story>, userId: string): Promise<Story> {
    // Обрабатываем base64 изображение, если оно есть
    const mediaUrl = FileUtils.saveBase64ImageSafe(
      storyData.mediaUrl,
      'stories',
    );

    const story = this.storiesRepository.create({
      ...storyData,
      mediaUrl,
      userId,
    });
    const savedStory = await this.storiesRepository.save(story);
    return this.findOne(savedStory.id);
  }

  async remove(id: string): Promise<void> {
    await this.storiesRepository.delete(id);
  }
}
