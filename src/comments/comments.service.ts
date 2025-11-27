import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../posts/entities/post.entity';
import { Reel } from '../reels/entities/reel.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Reel)
    private reelsRepository: Repository<Reel>,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    if (!createCommentDto.postId && !createCommentDto.reelId) {
      throw new BadRequestException('Comment must belong to a post or a reel');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      authorId: userId,
    });
    const savedComment = await this.commentsRepository.save(comment);

    if (createCommentDto.parentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parentId },
      });
      if (parentComment && parentComment.authorId !== userId) {
        await this.notificationsService.create(
          parentComment.authorId,
          userId,
          NotificationType.REPLY_COMMENT,
          savedComment.id,
        );
      }
    } else if (createCommentDto.postId) {
      const post = await this.postsRepository.findOne({
        where: { id: createCommentDto.postId },
      });
      if (post && post.authorId !== userId) {
        await this.notificationsService.create(
          post.authorId,
          userId,
          NotificationType.COMMENT_POST,
          createCommentDto.postId,
        );
      }
    } else if (createCommentDto.reelId) {
      const reel = await this.reelsRepository.findOne({
        where: { id: createCommentDto.reelId },
      });
      if (reel && reel.authorId !== userId) {
        await this.notificationsService.create(
          reel.authorId,
          userId,
          NotificationType.COMMENT_REEL,
          createCommentDto.reelId,
        );
      }
    }

    return savedComment;
  }

  async findByPost(postId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { postId, parentId: IsNull() }, // Get only top-level comments
      relations: ['author', 'children', 'children.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByReel(reelId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { reelId, parentId: IsNull() },
      relations: ['author', 'children', 'children.author'],
      order: { createdAt: 'DESC' },
    });
  }
}
