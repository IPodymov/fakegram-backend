import { IsBoolean } from 'class-validator';

export class Enable2FADto {
  @IsBoolean()
  enable: boolean;
}
