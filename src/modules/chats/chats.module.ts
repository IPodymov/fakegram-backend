import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './services/chats.service';
import { ChatsController } from './controllers/chats.controller';
import { Chat } from './domain/entities/chat.entity';
import { ChatMember } from './domain/entities/chat-member.entity';
import { Message } from './domain/entities/message.entity';
import { User } from '../users/domain/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, Message, User]),
    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
