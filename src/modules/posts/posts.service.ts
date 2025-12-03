import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['user', 'comments', 'likes'],
    });
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postsRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'likes'],
    });
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { userId },
      relations: ['user', 'comments', 'likes'],
    });
  }

  async create(postData: Partial<Post>, userId: string): Promise<Post> {
    // Обрабатываем base64 изображение, если оно есть
    let mediaUrl = postData.mediaUrl;
    if (mediaUrl && mediaUrl.startsWith('data:image')) {
      try {
        mediaUrl = FileUtils.saveBase64Image(mediaUrl, 'posts');
      } catch (error) {
        console.error('Error saving base64 image:', error);
        // Продолжаем без изображения в случае ошибки
        mediaUrl = null;
      }
    }

    const post = this.postsRepository.create({
      ...postData,
      mediaUrl,
      userId,
    });
    return this.postsRepository.save(post);
  }

  async update(id: string, postData: Partial<Post>): Promise<Post> {
    // Обрабатываем base64 изображение при обновлении
    let updateData = { ...postData };
    if (updateData.mediaUrl && updateData.mediaUrl.startsWith('data:image')) {
      try {
        updateData.mediaUrl = FileUtils.saveBase64Image(
          updateData.mediaUrl,
          'posts',
        );
      } catch (error) {
        console.error('Error saving base64 image:', error);
        delete updateData.mediaUrl;
      }
    }

    await this.postsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
