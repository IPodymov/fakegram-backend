import { IsOptional, IsString } from 'class-validator';

export class CreateReelDto {
  @IsOptional()
  @IsString()
  description?: string;
}
