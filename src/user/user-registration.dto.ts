import { ApiProperty } from '@nestjs/swagger';

export class UserRegistrationDto {
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123!' })
  password: string;

  @ApiProperty({ example: 'John' })
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  lastName?: string;
}
