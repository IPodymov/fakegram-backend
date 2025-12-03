import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@Controller('users')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post(':userId/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async follow(
    @Param('userId') userId: string,
    @CurrentUser() user: { id: string; username: string },
  ) {
    const follower = await this.followersService.follow(user.id, userId);
    return {
      message: 'Successfully followed user',
      followerId: follower.followerId,
      followingId: follower.followingId,
      createdAt: follower.createdAt,
    };
  }

  @Delete(':userId/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unfollow(
    @Param('userId') userId: string,
    @CurrentUser() user: { id: string; username: string },
  ) {
    await this.followersService.unfollow(user.id, userId);
    return { message: 'Successfully unfollowed user' };
  }

  @Get(':userId/followers')
  async getFollowers(@Param('userId') userId: string): Promise<User[]> {
    return this.followersService.getFollowers(userId);
  }

  @Get(':userId/following')
  async getFollowing(@Param('userId') userId: string): Promise<User[]> {
    return this.followersService.getFollowing(userId);
  }

  @Get(':userId/is-following')
  @UseGuards(JwtAuthGuard)
  async isFollowing(
    @Param('userId') userId: string,
    @CurrentUser() user: { id: string; username: string },
  ): Promise<{ isFollowing: boolean }> {
    return this.followersService.isFollowing(user.id, userId);
  }
}
