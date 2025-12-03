import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['user', 'comments', 'likes'] });
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
    const post = this.postsRepository.create({
      ...postData,
      userId,
    });
    return this.postsRepository.save(post);
  }

  async update(id: string, postData: Partial<Post>): Promise<Post> {
    await this.postsRepository.update(id, postData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
