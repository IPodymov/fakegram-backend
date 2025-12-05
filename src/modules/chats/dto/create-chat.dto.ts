import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ description: 'Array of user IDs to include in the chat', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiProperty({ description: 'Is this a group chat?', default: false })
  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;

  @ApiProperty({ description: 'Name of the group chat', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
