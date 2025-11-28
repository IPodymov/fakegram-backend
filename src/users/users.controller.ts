import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Request() req: { user: { userId: number } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/reels')
  async getReelHistory(@Request() req: { user: { userId: number } }) {
    return this.usersService.getReelHistory(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.follow(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  async unfollow(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.unfollow(req.user.userId, id);
  }

  @Get(':id/followers')
  async getFollowers(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getFollowers(id);
  }

  @Get(':id/following')
  async getFollowing(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getFollowing(id);
  }
}
