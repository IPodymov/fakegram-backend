import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JoinChatDto } from './dto/join-chat.dto';

@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat (direct or group)' })
  create(@Request() req, @Body() createChatDto: CreateChatDto) {
    return this.chatsService.createChat(req.user.id, createChatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats for current user' })
  findAll(@Request() req) {
    return this.chatsService.getUserChats(req.user.id);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a group chat by invite code' })
  join(@Request() req, @Body() joinChatDto: JoinChatDto) {
    return this.chatsService.joinByInviteCode(
      req.user.id,
      joinChatDto.inviteCode,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat details' })
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message to a chat' })
  sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatsService.sendMessage(id, req.user.id, sendMessageDto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages from a chat' })
  getMessages(@Request() req, @Param('id') id: string) {
    return this.chatsService.getMessages(id, req.user.id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Generate invite link for a group chat' })
  createInviteLink(@Request() req, @Param('id') id: string) {
    return this.chatsService.createInviteLink(id, req.user.id);
  }
}
