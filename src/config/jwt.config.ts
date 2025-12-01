/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get<string>('JWT_SECRET', 'default-secret-key'),
  signOptions: {
    expiresIn: configService.get<string>('JWT_EXPIRATION', '7d'),
  } as JwtSignOptions,
});
