import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class Verify2FADto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
