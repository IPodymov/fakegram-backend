import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('history/reels')
  async getReelHistory(@Request() req: { user: { userId: number } }) {
    return this.usersService.getReelHistory(req.user.userId);
  }
}
