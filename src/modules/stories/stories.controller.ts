import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { Story } from '../../entities/story.entity';
import { CreateStoryDto } from './dto/create-story.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  findAll(@Query('userId') userId?: string): Promise<Story[]> {
    if (userId) {
      return this.storiesService.findByUserId(userId);
    }
    return this.storiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Story | null> {
    return this.storiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createStoryDto: CreateStoryDto,
    @CurrentUser() user: { id: string; username: string },
  ): Promise<Story> {
    return this.storiesService.create(createStoryDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.storiesService.remove(id);
  }
}
