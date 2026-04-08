import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Post } from '../domain/entities/post.entity';
import { PostCreatedEvent, PostDeletedEvent } from '../events/post.events';
import { FileUtils } from '../../../common/utils/file.utils';
import { UrlService } from '../../../common/services/url.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private urlService: UrlService,
    private eventEmitter: EventEmitter2,
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

    this.eventEmitter.emit('post.created', new PostCreatedEvent(savedPost.id, userId, ''));

    return this.findOne(savedPost.id);
  }

  async update(id: string, postData: Partial<Post>): Promise<any> {
    const updateData = { ...postData };
    if (updateData.mediaUrl && updateData.mediaUrl.startsWith('data:image')) {
      const savedUrl = FileUtils.saveBase64ImageSafe(updateData.mediaUrl, 'posts');
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
    const post = await this.postsRepository.findOne({ where: { id } });
    await this.postsRepository.delete(id);
    if (post) {
      this.eventEmitter.emit('post.deleted', new PostDeletedEvent(id, post.userId));
    }
  }
}
