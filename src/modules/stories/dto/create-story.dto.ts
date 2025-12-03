import { IsString, IsOptional } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
