import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
import { Post } from './domain/entities/post.entity';
import { getJwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
