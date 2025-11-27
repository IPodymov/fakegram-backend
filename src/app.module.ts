import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ReelsModule } from './reels/reels.module';
import { ChatModule } from './chat/chat.module';
import { User } from './users/entities/user.entity';
import { Post } from './posts/entities/post.entity';
import { Reel } from './reels/entities/reel.entity';
import { ReelHistory } from './users/entities/reel-history.entity';
import { Message } from './chat/entities/message.entity';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/entities/comment.entity';
import { Follow } from './users/entities/follow.entity';
import { PostLike } from './posts/entities/post-like.entity';
import { ReelLike } from './reels/entities/reel-like.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Post, Reel, ReelHistory, Message, Comment, Follow, PostLike, ReelLike],
        synchronize: true, // В продакшене лучше использовать миграции
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    ReelsModule,
    ChatModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
