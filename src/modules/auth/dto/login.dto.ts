import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'Username или email пользователя', 
    example: 'john_doe'
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ 
    description: 'Пароль пользователя', 
    example: 'password123',
    minLength: 6
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
