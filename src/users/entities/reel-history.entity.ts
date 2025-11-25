import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity';
import { Reel } from '../../reels/entities/reel.entity';

@Entity()
export class ReelHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reelHistory)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Reel)
  @JoinColumn({ name: 'reelId' })
  reel: Reel;

  @Column()
  reelId: number;

  @CreateDateColumn()
  watchedAt: Date;
}
