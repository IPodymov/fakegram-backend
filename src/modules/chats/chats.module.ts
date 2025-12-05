import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Chat } from '../../entities/chat.entity';
import { ChatMember } from '../../entities/chat-member.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatMember, Message, User])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
