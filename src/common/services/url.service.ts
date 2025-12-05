import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { Post } from '../../entities/post.entity';
import { Story } from '../../entities/story.entity';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class UrlService {
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  formatUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${this.baseUrl}${url}`;
  }

  formatUserUrls(user: User): User {
    if (!user) return user;
    const formattedUser = { ...user };
    if (formattedUser.profilePictureUrl) {
      formattedUser.profilePictureUrl = this.formatUrl(
        formattedUser.profilePictureUrl,
      );
    }
    return formattedUser;
  }

  formatPostUrls(post: Post): Post {
    if (!post) return post;
    const formattedPost = { ...post };
    if (formattedPost.mediaUrl) {
      formattedPost.mediaUrl = this.formatUrl(formattedPost.mediaUrl);
    }
    if (formattedPost.user) {
      formattedPost.user = this.formatUserUrls(formattedPost.user);
    }
    return formattedPost;
  }

  formatStoryUrls(story: Story): Story {
    if (!story) return story;
    const formattedStory = { ...story };
    if (formattedStory.mediaUrl) {
      formattedStory.mediaUrl = this.formatUrl(formattedStory.mediaUrl);
    }
    if (formattedStory.user) {
      formattedStory.user = this.formatUserUrls(formattedStory.user);
    }
    return formattedStory;
  }

  formatNotificationUrls(notification: Notification): Notification {
    if (!notification) return notification;
    const formattedNotification = { ...notification };
    if (formattedNotification.user) {
      formattedNotification.user = this.formatUserUrls(
        formattedNotification.user,
      );
    }
    return formattedNotification;
  }
}
