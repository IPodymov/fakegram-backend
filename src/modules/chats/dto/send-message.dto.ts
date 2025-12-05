import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Base64 encoded image', required: false })
  @IsString()
  @IsOptional()
  mediaUrl?: string;
}
