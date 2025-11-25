import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 1,
        ...dto,
        password: 'hashedPassword',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(dto);
      expect(result).toEqual({ id: 1, email: dto.email, name: dto.name });
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user exists', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      mockUsersService.findOne.mockResolvedValue({ id: 1 });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const user = { id: 1, email: dto.email, password: 'hashedPassword' };
      mockUsersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(dto);
      expect(result).toEqual({ access_token: 'token' });
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const user = { id: 1, email: dto.email, password: 'hashedPassword' };
      mockUsersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
