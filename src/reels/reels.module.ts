import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { Reel } from './entities/reel.entity';
import { ReelHistory } from '../users/entities/reel-history.entity';
import { ReelLike } from './entities/reel-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reel, ReelHistory, ReelLike])],
  controllers: [ReelsController],
  providers: [ReelsService],
})
export class ReelsModule {}
