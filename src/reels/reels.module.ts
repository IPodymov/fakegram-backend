import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { Reel } from './entities/reel.entity';
import { ReelHistory } from '../users/entities/reel-history.entity';
import { ReelLike } from './entities/reel-like.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reel, ReelHistory, ReelLike]), NotificationsModule],
  controllers: [ReelsController],
  providers: [ReelsService],
})
export class ReelsModule {}
