import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Chat } from './chat.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'chat_id' })
  chatId: string;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'media_url', nullable: true })
  mediaUrl: string;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
