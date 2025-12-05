import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Chat } from './chat.entity';

@Entity('chat_members')
export class ChatMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'chat_id' })
  chatId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
