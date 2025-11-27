import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async sendMessage(
    senderId: number,
    sendMessageDto: SendMessageDto,
    file?: Express.Multer.File,
  ): Promise<Message> {
    let attachmentUrl: string | null = null;
    let attachmentType: 'image' | 'video' | 'file' | null = null;

    if (file) {
      attachmentUrl = `/uploads/${file.filename}`;
      if (file.mimetype.startsWith('image/')) {
        attachmentType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        attachmentType = 'video';
      } else {
        attachmentType = 'file';
      }
    }

    const message = this.messageRepository.create({
      senderId,
      receiverId: sendMessageDto.receiverId,
      content: sendMessageDto.content,
      attachmentUrl,
      attachmentType,
    });
    return this.messageRepository.save(message);
  }

  async getConversation(userId: number, otherUserId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: {
        createdAt: 'ASC',
      },
      relations: ['sender', 'receiver'],
    });
  }

  async getMyConversations(userId: number) {
    // Получаем последние сообщения для каждого собеседника
    // Это сложный запрос, для простоты можно получить все сообщения и сгруппировать в JS,
    // но лучше использовать QueryBuilder для производительности.
    
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    const conversations = new Map<number, Message>();

    messages.forEach((msg) => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, msg);
      }
    });

    return Array.from(conversations.values());
  }
}
