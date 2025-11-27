import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    userId: number,
    createPostDto: CreatePostDto,
    file?: Express.Multer.File,
  ): Promise<Post> {
    const postData = {
      ...createPostDto,
      authorId: userId,
      mediaUrl: file ? `/uploads/${file.filename}` : null,
      mediaType: file
        ? file.mimetype.startsWith('image/')
          ? 'image'
          : 'video'
        : null,
    };
    const post = this.postsRepository.create(postData);
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['author', 'likes'],
      select: {
        author: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
  }

  async toggleLike(userId: number, postId: number): Promise<void> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.postLikesRepository.findOne({
      where: { userId, postId },
    });

    if (existingLike) {
      await this.postLikesRepository.remove(existingLike);
    } else {
      const like = this.postLikesRepository.create({ userId, postId });
      await this.postLikesRepository.save(like);

      await this.notificationsService.create(
        post.authorId,
        userId,
        NotificationType.LIKE_POST,
        postId,
      );
    }
  }
}
