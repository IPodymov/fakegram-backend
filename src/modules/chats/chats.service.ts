import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Chat } from '../../entities/chat.entity';
import { ChatMember } from '../../entities/chat-member.entity';
import { Message } from '../../entities/message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../../entities/user.entity';
import { FileUtils } from '../../common/utils/file.utils';
import { UrlService } from '../../common/services/url.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private chatsRepository: Repository<Chat>,
    @InjectRepository(ChatMember)
    private chatMembersRepository: Repository<ChatMember>,
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private urlService: UrlService,
  ) {}

  async createChat(
    userId: string,
    createChatDto: CreateChatDto,
  ): Promise<Chat> {
    const { userIds, isGroup, name } = createChatDto;
    const allUserIds = [...new Set([...userIds, userId])]; // Ensure unique and include creator

    if (!isGroup && allUserIds.length === 2) {
      // Check if direct chat already exists
      const otherUserId = allUserIds.find((id) => id !== userId);
      const existingChat = await this.findDirectChat(userId, otherUserId);
      if (existingChat) return existingChat;
    }

    const chat = this.chatsRepository.create({
      isGroup: !!isGroup,
      name: isGroup ? name : null,
    });
    const savedChat = await this.chatsRepository.save(chat);

    const members = allUserIds.map((uid) => {
      return this.chatMembersRepository.create({
        chatId: savedChat.id,
        userId: uid,
        isAdmin: uid === userId, // Creator is admin
      });
    });
    await this.chatMembersRepository.save(members);

    return this.findOne(savedChat.id);
  }

  async findDirectChat(userId1: string, userId2: string): Promise<Chat | null> {
    const user1Chats = await this.chatMembersRepository.find({
      where: { userId: userId1 },
      relations: ['chat'],
    });
    const user1ChatIds = user1Chats.map((m) => m.chatId);

    if (user1ChatIds.length === 0) return null;

    const commonMembers = await this.chatMembersRepository.find({
      where: {
        chatId: In(user1ChatIds),
        userId: userId2,
      },
      relations: ['chat'],
    });

    for (const member of commonMembers) {
      if (!member.chat.isGroup) {
        return this.findOne(member.chatId);
      }
    }
    return null;
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    const memberships = await this.chatMembersRepository.find({
      where: { userId },
      relations: ['chat'],
      order: { joinedAt: 'DESC' },
    });

    const chatIds = memberships.map((m) => m.chatId);
    if (chatIds.length === 0) return [];

    const chats = await this.chatsRepository.find({
      where: { id: In(chatIds) },
      relations: ['members', 'members.user', 'messages'],
      order: { updatedAt: 'DESC' },
    });

    // Format URLs for users in members
    chats.forEach((chat) => {
      chat.members.forEach((member) => {
        this.urlService.formatUserUrls(member.user);
      });
    });

    return chats;
  }

  async findOne(id: string): Promise<Chat> {
    const chat = await this.chatsRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'messages', 'messages.sender'],
    });
    if (!chat) throw new NotFoundException('Chat not found');

    chat.members.forEach((member) => this.urlService.formatUserUrls(member.user));
    chat.messages.forEach((message) => {
      if (message.sender) this.urlService.formatUserUrls(message.sender);
    });

    return chat;
  }

  async sendMessage(
    chatId: string,
    userId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    const member = await this.chatMembersRepository.findOne({
      where: { chatId, userId },
    });
    if (!member)
      throw new ForbiddenException('You are not a member of this chat');

    let mediaUrl = sendMessageDto.mediaUrl;
    if (mediaUrl && mediaUrl.startsWith('data:image')) {
      const savedUrl = FileUtils.saveBase64ImageSafe(mediaUrl, 'messages');
      if (savedUrl) mediaUrl = savedUrl;
      else throw new BadRequestException('Failed to save image');
    }

    const message = this.messagesRepository.create({
      chatId,
      senderId: userId,
      content: sendMessageDto.content,
      mediaUrl,
    });
    const savedMessage = await this.messagesRepository.save(message);

    await this.chatsRepository.update(chatId, { updatedAt: new Date() });

    return this.messagesRepository
      .findOne({
        where: { id: savedMessage.id },
        relations: ['sender'],
      })
      .then((msg) => {
        this.urlService.formatUserUrls(msg.sender);
        return msg;
      });
  }

  async getMessages(chatId: string, userId: string): Promise<Message[]> {
    const member = await this.chatMembersRepository.findOne({
      where: { chatId, userId },
    });
    if (!member)
      throw new ForbiddenException('You are not a member of this chat');

    const messages = await this.messagesRepository.find({
      where: { chatId },
      relations: ['sender'],
      order: { sentAt: 'ASC' },
    });

    messages.forEach((msg) => {
      if (msg.sender) this.urlService.formatUserUrls(msg.sender);
    });

    return messages;
  }

  async createInviteLink(chatId: string, userId: string): Promise<string> {
    const member = await this.chatMembersRepository.findOne({
      where: { chatId, userId },
    });
    if (!member)
      throw new ForbiddenException('You are not a member of this chat');

    const chat = await this.chatsRepository.findOne({ where: { id: chatId } });
    if (!chat.isGroup)
      throw new BadRequestException('Cannot create invite link for direct chat');

    if (!chat.inviteCode) {
      chat.inviteCode = randomBytes(8).toString('hex');
      await this.chatsRepository.save(chat);
    }

    return chat.inviteCode;
  }

  async joinByInviteCode(userId: string, inviteCode: string): Promise<Chat> {
    const chat = await this.chatsRepository.findOne({ where: { inviteCode } });
    if (!chat) throw new NotFoundException('Invalid invite code');

    const existingMember = await this.chatMembersRepository.findOne({
      where: { chatId: chat.id, userId },
    });
    if (existingMember) return this.findOne(chat.id);

    const member = this.chatMembersRepository.create({
      chatId: chat.id,
      userId,
      isAdmin: false,
    });
    await this.chatMembersRepository.save(member);

    return this.findOne(chat.id);
  }
}
