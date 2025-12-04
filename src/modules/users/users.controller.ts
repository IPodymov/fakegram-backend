import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей', description: 'Возвращает список всех зарегистрированных пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей получен успешно' })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск пользователей', description: 'Поиск пользователей по username (частичное совпадение)' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос', required: true, example: 'john' })
  @ApiResponse({ status: 200, description: 'Результаты поиска' })
  @ApiResponse({ status: 400, description: 'Параметр поиска обязателен' })
  search(@Query('q') query: string): Promise<User[]> {
    if (!query) {
      throw new HttpException(
        'Search query is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.searchByUsername(query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Рекомендации пользователей', description: 'Получить рекомендации пользователей для подписки (на основе популярности)' })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'limit', description: 'Количество рекомендаций', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Список рекомендованных пользователей' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  @UseGuards(JwtAuthGuard)
  getSuggestions(
    @CurrentUser() user: { id: string; username: string },
    @Query('limit') limit?: string,
  ): Promise<User[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersService.getSuggestedUsers(user.id, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Get('username/:username')
  findByUsername(@Param('username') username: string): Promise<User | null> {
    return this.usersService.findByUsername(username);
  }

  @Post()
  create(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Проверка уникальности username, если он меняется
    if (updateUserDto.username) {
      const existingUser = await this.usersService.findByUsername(
        updateUserDto.username,
      );
      if (existingUser && existingUser.id !== id) {
        throw new HttpException('Username already taken', HttpStatus.CONFLICT);
      }
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${req.params.id}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new HttpException(
              'Only image files are allowed!',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ profilePictureUrl: string }> {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const profilePictureUrl = `/uploads/profile-pictures/${file.filename}`;
    await this.usersService.update(id, { profilePictureUrl });

    return { profilePictureUrl };
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
