import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from './post.entity';
import { Story } from './story.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Follower } from './follower.entity';
import { ChatMember } from './chat-member.entity';
import { Notification } from './notification.entity';
import { Reel } from './reel.entity';
import { UserReelHistory } from './user-reel-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'profile_picture_url', nullable: true })
  profilePictureUrl: string;

  @Column({ nullable: true })
  website: string;

  @Column({ name: 'is_private', default: false })
  isPrivate: boolean;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_code', nullable: true })
  @Exclude()
  twoFactorCode: string;

  @Column({ name: 'two_factor_code_expires_at', nullable: true })
  @Exclude()
  twoFactorCodeExpiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Story, (story) => story.user)
  stories: Story[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Follower, (follower) => follower.follower)
  following: Follower[];

  @OneToMany(() => Follower, (follower) => follower.following)
  followers: Follower[];

  @OneToMany(() => ChatMember, (member) => member.user)
  chatMemberships: ChatMember[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Reel, (reel) => reel.user)
  reels: Reel[];

  @OneToMany(() => UserReelHistory, (history) => history.user)
  reelHistory: UserReelHistory[];
}
