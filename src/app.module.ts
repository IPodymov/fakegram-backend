import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { StoriesModule } from './modules/stories/stories.module';
import { FollowersModule } from './modules/followers/followers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ShortLinksModule } from './modules/short-links/short-links.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    StoriesModule,
    FollowersModule,
    NotificationsModule,
    ShortLinksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
