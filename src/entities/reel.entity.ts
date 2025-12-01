import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { UserReelHistory } from './user-reel-history.entity';

@Entity('reels')
export class Reel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'media_url' })
  mediaUrl: string;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.reels)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => UserReelHistory, (history) => history.reel)
  viewHistory: UserReelHistory[];
}
