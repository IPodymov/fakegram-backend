import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FollowersController } from './followers.controller';
import { FollowersService } from './followers.service';
import { Follower } from '../../entities/follower.entity';
import { User } from '../../entities/user.entity';
import { getJwtConfig } from '../../config/jwt.config';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follower, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
  controllers: [FollowersController],
  providers: [FollowersService],
  exports: [FollowersService],
})
export class FollowersModule {}
