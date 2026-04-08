import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { Notification } from './domain/entities/notification.entity';
import { User } from '../users/domain/entities/user.entity';
import { getJwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
