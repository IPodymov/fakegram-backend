import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Уникальное имя пользователя (только английские буквы, цифры, _ и .)', 
    example: 'john_doe',
    minLength: 3,
    pattern: '^[a-zA-Z0-9_.]+$'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message: 'Username can only contain English letters, numbers, underscore and dot',
  })
  username: string;

  @ApiProperty({ 
    description: 'Email адрес пользователя', 
    example: 'john@example.com',
    format: 'email'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Пароль пользователя', 
    example: 'password123',
    minLength: 6
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
