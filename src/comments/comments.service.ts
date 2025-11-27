import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
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
    return this.commentsRepository.save(comment);
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
