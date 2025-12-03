import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Post } from '../../entities/post.entity';
import { FileUtils } from '../../common/utils/file.utils';

@Injectable()
export class PostsService {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  async findAll(): Promise<Post[]> {
    const posts = await this.postsRepository.find({
      relations: ['user', 'comments', 'likes'],
    });
    return posts.map((post) => this.formatPostUrls(post));
  }

  async findOne(id: string): Promise<Post | null> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'likes'],
    });
    return post ? this.formatPostUrls(post) : null;
  }

  async findByUserId(userId: string): Promise<Post[]> {
    const posts = await this.postsRepository.find({
      where: { userId },
      relations: ['user', 'comments', 'likes'],
    });
    return posts.map((post) => this.formatPostUrls(post));
  }

  private formatPostUrls(post: Post): Post {
    const formattedPost = { ...post };

    if (formattedPost.mediaUrl && !formattedPost.mediaUrl.startsWith('http')) {
      formattedPost.mediaUrl = `${this.baseUrl}${formattedPost.mediaUrl}`;
    }

    if (formattedPost.user) {
      formattedPost.user = { ...formattedPost.user };
      if (
        formattedPost.user.profilePictureUrl &&
        !formattedPost.user.profilePictureUrl.startsWith('http')
      ) {
        formattedPost.user.profilePictureUrl = `${this.baseUrl}${formattedPost.user.profilePictureUrl}`;
      }
    }

    return formattedPost;
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
    const savedPost = await this.postsRepository.save(post);
    return this.findOne(savedPost.id);
  }

  async update(id: string, postData: Partial<Post>): Promise<Post> {
    // Обрабатываем base64 изображение при обновлении
    const updateData = { ...postData };
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
