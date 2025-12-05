import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlService } from './services/url.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [UrlService],
  exports: [UrlService],
})
export class CommonModule {}
