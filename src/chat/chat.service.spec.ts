import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

describe('ChatService', () => {
  let service: ChatService;
  let repository: Repository<Message>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    repository = module.get<Repository<Message>>(getRepositoryToken(Message));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should create and save a message', async () => {
      const senderId = 1;
      const dto = { receiverId: 2, content: 'Hello' };
      const savedMessage = { id: 1, senderId, ...dto, attachmentUrl: null, attachmentType: null };
      
      mockRepository.create.mockReturnValue(savedMessage);
      mockRepository.save.mockResolvedValue(savedMessage);

      const result = await service.sendMessage(senderId, dto);
      expect(result).toBe(savedMessage);
      expect(mockRepository.create).toHaveBeenCalledWith({
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        attachmentUrl: null,
        attachmentType: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(savedMessage);
    });

    it('should create message with attachment', async () => {
      const senderId = 1;
      const dto = { receiverId: 2 };
      const file = { filename: 'test.jpg', mimetype: 'image/jpeg' } as any;
      const savedMessage = { 
        id: 1, 
        senderId, 
        receiverId: 2, 
        content: undefined, 
        attachmentUrl: '/uploads/test.jpg', 
        attachmentType: 'image' 
      };

      mockRepository.create.mockReturnValue(savedMessage);
      mockRepository.save.mockResolvedValue(savedMessage);

      const result = await service.sendMessage(senderId, dto, file);
      expect(result).toBe(savedMessage);
      expect(mockRepository.create).toHaveBeenCalledWith({
        senderId,
        receiverId: dto.receiverId,
        content: undefined,
        attachmentUrl: '/uploads/test.jpg',
        attachmentType: 'image',
      });
    });
  });
});
