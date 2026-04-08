import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { EventsModule } from './infrastructure/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { StoriesModule } from './modules/stories/stories.module';
import { FollowersModule } from './modules/followers/followers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ShortLinksModule } from './modules/short-links/short-links.module';
import { ChatsModule } from './modules/chats/chats.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    EventsModule,
    CommonModule,
    UsersModule,
    AuthModule,
    PostsModule,
    StoriesModule,
    FollowersModule,
    NotificationsModule,
    ShortLinksModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
