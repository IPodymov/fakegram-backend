import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ReelLike } from './reel-like.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity()
export class Reel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text' })
  videoUrl: string;

  @ManyToOne(() => User, (user) => user.reels)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: number;

  @OneToMany(() => ReelLike, (like) => like.reel)
  likes: ReelLike[];

  @OneToMany(() => Comment, (comment) => comment.reel)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
