import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ReelHistory } from './entities/reel-history.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let reelHistoryRepository: Repository<ReelHistory>;

  const mockUsersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockReelHistoryRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(ReelHistory),
          useValue: mockReelHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    reelHistoryRepository = module.get<Repository<ReelHistory>>(
      getRepositoryToken(ReelHistory),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com';
      const user = { id: 1, email };
      mockUsersRepository.findOne.mockResolvedValue(user);

      expect(await service.findOne(email)).toBe(user);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const userData = { email: 'test@example.com', password: 'password' };
      const savedUser = { id: 1, ...userData };
      mockUsersRepository.create.mockReturnValue(savedUser);
      mockUsersRepository.save.mockResolvedValue(savedUser);

      expect(await service.create(userData)).toBe(savedUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(userData);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(savedUser);
    });
  });

  describe('getReelHistory', () => {
    it('should return reel history', async () => {
      const userId = 1;
      const history = [{ id: 1, userId, reelId: 1 }];
      mockReelHistoryRepository.find.mockResolvedValue(history);

      expect(await service.getReelHistory(userId)).toBe(history);
      expect(mockReelHistoryRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['reel', 'reel.author'],
        order: { watchedAt: 'DESC' },
      });
    });
  });
});
