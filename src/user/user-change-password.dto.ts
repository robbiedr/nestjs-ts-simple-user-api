import { ApiProperty } from '@nestjs/swagger';

export class UserChangePasswordDto {
  @ApiProperty({ example: 'P@ssw0rd123!' })
  currentPassword: string;

  @ApiProperty({ example: 'n3wP@ssw0rd123!' })
  newPassword: string;

  userId?: string;
}
