import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShortLinksController } from './short-links.controller';
import { ShortLinksService } from './short-links.service';
import { ShortLink } from '../../entities/short-link.entity';
import { User } from '../../entities/user.entity';
import { getJwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortLink, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [ShortLinksController],
  providers: [ShortLinksService],
  exports: [ShortLinksService],
})
export class ShortLinksModule {}
