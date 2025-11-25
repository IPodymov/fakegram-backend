import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

describe('PostsService', () => {
  let service: PostsService;
  let repository: Repository<Post>;

  const mockPostsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostsRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const userId = 1;
      const dto = { title: 'Test Post' };
      const file = { filename: 'test.jpg', mimetype: 'image/jpeg' } as any;
      const savedPost = { id: 1, ...dto, authorId: userId };
      
      mockPostsRepository.create.mockReturnValue(savedPost);
      mockPostsRepository.save.mockResolvedValue(savedPost);

      const result = await service.create(userId, dto, file);
      expect(result).toBe(savedPost);
      expect(mockPostsRepository.create).toHaveBeenCalled();
      expect(mockPostsRepository.save).toHaveBeenCalledWith(savedPost);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [{ id: 1, title: 'Test Post' }];
      mockPostsRepository.find.mockResolvedValue(posts);

      const result = await service.findAll();
      expect(result).toBe(posts);
      expect(mockPostsRepository.find).toHaveBeenCalled();
    });
  });
});
