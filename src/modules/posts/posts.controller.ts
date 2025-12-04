import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from '../../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить посты', description: 'Получить все посты или посты конкретного пользователя' })
  @ApiQuery({ name: 'userId', description: 'ID пользователя для фильтрации', required: false })
  @ApiResponse({ status: 200, description: 'Список постов' })
  findAll(@Query('userId') userId?: string): Promise<PostEntity[]> {
    if (userId) {
      return this.postsService.findByUserId(userId);
    }
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пост по ID', description: 'Получить детали одного поста' })
  @ApiParam({ name: 'id', description: 'ID поста' })
  @ApiResponse({ status: 200, description: 'Пост найден' })
  @ApiResponse({ status: 404, description: 'Пост не найден' })
  findOne(@Param('id') id: string): Promise<PostEntity | null> {
    return this.postsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать пост', description: 'Создать новый пост с изображением (base64) и подписью' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Пост создан успешно' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: { id: string; username: string },
  ): Promise<PostEntity> {
    try {
      return await this.postsService.create(createPostDto, user.id);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.postsService.remove(id);
  }
}
