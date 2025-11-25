import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReelsService } from './reels.service';
import { Reel } from './entities/reel.entity';
import { ReelHistory } from '../users/entities/reel-history.entity';
import { Repository } from 'typeorm';

describe('ReelsService', () => {
  let service: ReelsService;
  let reelsRepository: Repository<Reel>;
  let reelHistoryRepository: Repository<ReelHistory>;

  const mockReelsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockReelHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReelsService,
        {
          provide: getRepositoryToken(Reel),
          useValue: mockReelsRepository,
        },
        {
          provide: getRepositoryToken(ReelHistory),
          useValue: mockReelHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<ReelsService>(ReelsService);
    reelsRepository = module.get<Repository<Reel>>(getRepositoryToken(Reel));
    reelHistoryRepository = module.get<Repository<ReelHistory>>(
      getRepositoryToken(ReelHistory),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reel', async () => {
      const userId = 1;
      const dto = { description: 'Test Reel' };
      const file = { filename: 'test.mp4' } as any;
      const savedReel = { id: 1, ...dto, authorId: userId };

      mockReelsRepository.create.mockReturnValue(savedReel);
      mockReelsRepository.save.mockResolvedValue(savedReel);

      const result = await service.create(userId, dto, file);
      expect(result).toBe(savedReel);
      expect(mockReelsRepository.create).toHaveBeenCalled();
      expect(mockReelsRepository.save).toHaveBeenCalledWith(savedReel);
    });
  });

  describe('findAll', () => {
    it('should return all reels', async () => {
      const reels = [{ id: 1, description: 'Test Reel' }];
      mockReelsRepository.find.mockResolvedValue(reels);

      const result = await service.findAll();
      expect(result).toBe(reels);
      expect(mockReelsRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reel', async () => {
      const reel = { id: 1, description: 'Test Reel' };
      mockReelsRepository.findOne.mockResolvedValue(reel);

      const result = await service.findOne(1);
      expect(result).toBe(reel);
      expect(mockReelsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
    });
  });

  describe('markAsWatched', () => {
    it('should mark reel as watched', async () => {
      const userId = 1;
      const reelId = 1;
      const history = { id: 1, userId, reelId };

      mockReelHistoryRepository.create.mockReturnValue(history);
      mockReelHistoryRepository.save.mockResolvedValue(history);

      const result = await service.markAsWatched(userId, reelId);
      expect(result).toBe(history);
      expect(mockReelHistoryRepository.create).toHaveBeenCalledWith({
        userId,
        reelId,
      });
      expect(mockReelHistoryRepository.save).toHaveBeenCalledWith(history);
    });
  });
});
