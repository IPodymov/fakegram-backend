import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async sendMessage(
    @Request() req,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.chatService.sendMessage(req.user.userId, sendMessageDto, file);
  }

  @Get('history/:userId')
  async getConversation(
    @Request() req,
    @Param('userId', ParseIntPipe) otherUserId: number,
  ) {
    return this.chatService.getConversation(req.user.userId, otherUserId);
  }

  @Get('conversations')
  async getMyConversations(@Request() req) {
    return this.chatService.getMyConversations(req.user.userId);
  }
}
