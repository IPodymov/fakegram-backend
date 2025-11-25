import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { Reel } from './entities/reel.entity';
import { ReelHistory } from '../users/entities/reel-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reel, ReelHistory])],
  controllers: [ReelsController],
  providers: [ReelsService],
  exports: [ReelsService],
})
export class ReelsModule {}
