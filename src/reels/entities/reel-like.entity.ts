import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reel } from './reel.entity';

@Entity()
export class ReelLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  reelId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Reel, (reel) => reel.likes)
  @JoinColumn({ name: 'reelId' })
  reel: Reel;

  @CreateDateColumn()
  createdAt: Date;
}
