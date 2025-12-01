import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'media_url' })
  mediaUrl: string;

  @Column({ name: 'is_video', default: false })
  isVideo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'viewers_count', default: 0 })
  viewersCount: number;

  @ManyToOne(() => User, (user) => user.stories)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
