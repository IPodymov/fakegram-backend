import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
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
      relations: ['author'],
      select: {
        author: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
  }
}
