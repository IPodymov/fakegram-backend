import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { FileUtils } from '../../common/utils/file.utils';
import { UrlService } from '../../common/services/url.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private urlService: UrlService,
  ) {}

  private transformPost(post: Post): any {
    return {
      ...post,
      imageUrl: post.mediaUrl,
      likes: post.likes?.length ?? 0,
      comments: post.comments?.length ?? 0,
    };
  }

  async findAll(): Promise<any[]> {
    const posts = await this.postsRepository.find({
      relations: ['user', 'comments', 'likes'],
    });
    return posts.map((post) => this.transformPost(this.urlService.formatPostUrls(post)));
  }

  async findOne(id: string): Promise<any | null> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'likes'],
    });
    return post ? this.transformPost(this.urlService.formatPostUrls(post)) : null;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const posts = await this.postsRepository.find({
      where: { userId },
      relations: ['user', 'comments', 'likes'],
    });
    return posts.map((post) => this.transformPost(this.urlService.formatPostUrls(post)));
  }

  async create(postData: Partial<Post> & { image?: string }, userId: string): Promise<any> {
    // Обрабатываем base64 изображение, если оно есть
    let mediaUrl = postData.mediaUrl || postData.image;
    if (mediaUrl && mediaUrl.startsWith('data:image')) {
      const savedUrl = FileUtils.saveBase64ImageSafe(mediaUrl, 'posts');
      if (savedUrl) {
        mediaUrl = savedUrl;
      } else {
        throw new BadRequestException('Failed to save post image');
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
      const savedUrl = FileUtils.saveBase64ImageSafe(
        updateData.mediaUrl,
        'posts',
      );
      if (savedUrl) {
        updateData.mediaUrl = savedUrl;
      } else {
        throw new BadRequestException('Failed to save post image');
      }
    }

    await this.postsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
