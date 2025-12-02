/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional, IsBoolean, IsUrl, MinLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message: 'Username can only contain English letters, numbers, underscore and dot',
  })
  username?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
