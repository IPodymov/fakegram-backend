import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '../../../posts/domain/entities/post.entity';
import { Story } from '../../../stories/domain/entities/story.entity';
import { Comment } from '../../../posts/domain/entities/comment.entity';
import { Like } from '../../../posts/domain/entities/like.entity';
import { Follower } from '../../../followers/domain/entities/follower.entity';
import { ChatMember } from '../../../chats/domain/entities/chat-member.entity';
import { Notification } from '../../../notifications/domain/entities/notification.entity';
import { Reel } from '../../../posts/domain/entities/reel.entity';
import { UserReelHistory } from '../../../posts/domain/entities/user-reel-history.entity';

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
