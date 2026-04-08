import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsNotEmpty()
  @IsString()
  caption: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isVideo?: boolean;

  @IsOptional()
  @IsString()
  location?: string;
}
