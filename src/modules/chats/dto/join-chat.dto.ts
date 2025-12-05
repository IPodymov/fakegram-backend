import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinChatDto {
  @ApiProperty({ description: 'Invite code to join the group' })
  @IsString()
  inviteCode: string;
}
