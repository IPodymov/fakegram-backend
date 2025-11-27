import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMessageDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  receiverId: number;

  @IsOptional()
  @IsString()
  content?: string;
}
