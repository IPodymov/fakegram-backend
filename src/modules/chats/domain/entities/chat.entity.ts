import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ChatMember } from './chat-member.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'is_group', default: false })
  isGroup: boolean;

  @Column({ name: 'invite_code', nullable: true, unique: true })
  inviteCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ChatMember, (member) => member.chat)
  members: ChatMember[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
