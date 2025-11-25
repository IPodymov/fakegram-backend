import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const req = { user: { userId: 1 } };
      const dto: CreatePostDto = { title: 'Test Post' };
      const file = { filename: 'test.jpg', mimetype: 'image/jpeg' } as any;
      const result = { id: 1, ...dto };
      mockPostsService.create.mockResolvedValue(result);

      expect(await controller.create(req, dto, file)).toBe(result);
      expect(mockPostsService.create).toHaveBeenCalledWith(1, dto, file);
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const result = [{ id: 1, title: 'Test Post' }];
      mockPostsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockPostsService.findAll).toHaveBeenCalled();
    });
  });
});
