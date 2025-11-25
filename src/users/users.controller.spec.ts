import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getReelHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReelHistory', () => {
    it('should return reel history for the user', async () => {
      const userId = 1;
      const result = [{ id: 1, userId, reelId: 1, watchedAt: new Date() }];
      mockUsersService.getReelHistory.mockResolvedValue(result);

      expect(await controller.getReelHistory({ user: { userId } })).toBe(result);
      expect(mockUsersService.getReelHistory).toHaveBeenCalledWith(userId);
    });
  });
});
