import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: { user: { userId: number } },
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(req.user.userId, createCommentDto);
  }

  @Get('post/:id')
  async findByPost(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findByPost(id);
  }

  @Get('reel/:id')
  async findByReel(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findByReel(id);
  }
}
