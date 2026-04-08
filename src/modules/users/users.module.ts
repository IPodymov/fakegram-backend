import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './domain/entities/user.entity';
import { Follower } from '../followers/domain/entities/follower.entity';
import { getJwtConfig } from '../../config/jwt.config';
import { ShortLinksModule } from '../short-links/short-links.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Follower]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    ShortLinksModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
