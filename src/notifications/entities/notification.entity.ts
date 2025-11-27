import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  FOLLOW = 'follow',
  LIKE_POST = 'like_post',
  LIKE_REEL = 'like_reel',
  COMMENT_POST = 'comment_post',
  COMMENT_REEL = 'comment_reel',
  REPLY_COMMENT = 'reply_comment',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipientId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  actorId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actorId' })
  actor: User;

  @Column({
    type: 'text', // Using text to avoid enum migration issues for now
  })
  type: NotificationType;

  @Column({ nullable: true })
  resourceId: number;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
