import { Test, TestingModule } from '@nestjs/testing';
import { ReelsController } from './reels.controller';
import { ReelsService } from './reels.service';
import { CreateReelDto } from './dto/create-reel.dto';

describe('ReelsController', () => {
  let controller: ReelsController;
  let service: ReelsService;

  const mockReelsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    markAsWatched: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReelsController],
      providers: [
        {
          provide: ReelsService,
          useValue: mockReelsService,
        },
      ],
    }).compile();

    controller = module.get<ReelsController>(ReelsController);
    service = module.get<ReelsService>(ReelsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reel', async () => {
      const req = { user: { userId: 1 } };
      const dto: CreateReelDto = { description: 'Test Reel' };
      const file = { filename: 'test.mp4', mimetype: 'video/mp4' } as any;
      const result = { id: 1, ...dto };
      mockReelsService.create.mockResolvedValue(result);

      expect(await controller.create(req, dto, file)).toBe(result);
      expect(mockReelsService.create).toHaveBeenCalledWith(1, dto, file);
    });

    it('should throw error if file is missing', async () => {
      const req = { user: { userId: 1 } };
      const dto: CreateReelDto = { description: 'Test Reel' };
      
      await expect(controller.create(req, dto, undefined as any)).rejects.toThrow('Video file is required');
    });
  });

  describe('findAll', () => {
    it('should return all reels', async () => {
      const result = [{ id: 1, description: 'Test Reel' }];
      mockReelsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockReelsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reel', async () => {
      const result = { id: 1, description: 'Test Reel' };
      mockReelsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
      expect(mockReelsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('watch', () => {
    it('should mark reel as watched', async () => {
      const req = { user: { userId: 1 } };
      const result = { id: 1, userId: 1, reelId: 1 };
      mockReelsService.markAsWatched.mockResolvedValue(result);

      expect(await controller.watch(req, 1)).toBe(result);
      expect(mockReelsService.markAsWatched).toHaveBeenCalledWith(1, 1);
    });
  });
});
