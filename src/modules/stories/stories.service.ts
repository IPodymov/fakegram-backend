import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Story } from '../../entities/story.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class StoriesService {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Story)
    private storiesRepository: Repository<Story>,
    private configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  private formatStoryUrls(story: Story): Story {
    const formattedStory = { ...story };

    if (formattedStory.mediaUrl && !formattedStory.mediaUrl.startsWith('http')) {
      formattedStory.mediaUrl = `${this.baseUrl}${formattedStory.mediaUrl}`;
    }

    if (formattedStory.user) {
      formattedStory.user = { ...formattedStory.user };
      if (
        formattedStory.user.profilePictureUrl &&
        !formattedStory.user.profilePictureUrl.startsWith('http')
      ) {
        formattedStory.user.profilePictureUrl = `${this.baseUrl}${formattedStory.user.profilePictureUrl}`;
      }
    }

    return formattedStory;
  }

  async findAll(): Promise<Story[]> {
    const stories = await this.storiesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return stories.map((story) => this.formatStoryUrls(story));
  }

  async findOne(id: string): Promise<Story | null> {
    const story = await this.storiesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return story ? this.formatStoryUrls(story) : null;
  }

  async findByUserId(userId: string): Promise<Story[]> {
    const stories = await this.storiesRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return stories.map((story) => this.formatStoryUrls(story));
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
    const savedStory = await this.storiesRepository.save(story);
    return this.findOne(savedStory.id);
  }

  async remove(id: string): Promise<void> {
    await this.storiesRepository.delete(id);
  }
}
