import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Reel } from './reel.entity';

@Entity('user_reel_history')
export class UserReelHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'reel_id' })
  reelId: string;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt: Date;

  @ManyToOne(() => User, (user) => user.reelHistory)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Reel, (reel) => reel.viewHistory)
  @JoinColumn({ name: 'reel_id' })
  reel: Reel;
}
