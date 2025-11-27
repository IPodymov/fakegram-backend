import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Repository, IsNull } from 'typeorm';

describe('CommentsService', () => {
  let service: CommentsService;
  let repository: Repository<Comment>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    repository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const userId = 1;
      const dto = { content: 'Test comment', postId: 1 };
      const savedComment = { id: 1, authorId: userId, ...dto };
      
      mockRepository.create.mockReturnValue(savedComment);
      mockRepository.save.mockResolvedValue(savedComment);

      const result = await service.create(userId, dto);
      expect(result).toBe(savedComment);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        authorId: userId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(savedComment);
    });
  });

  describe('findByPost', () => {
    it('should return comments for a post', async () => {
      const postId = 1;
      const comments = [{ id: 1, content: 'Test', postId }];
      mockRepository.find.mockResolvedValue(comments);

      const result = await service.findByPost(postId);
      expect(result).toBe(comments);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { postId, parentId: IsNull() },
        relations: ['author', 'children', 'children.author'],
        order: { createdAt: 'DESC' },
      });
    });
  });
});
