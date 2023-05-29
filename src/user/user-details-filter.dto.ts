import { ApiProperty } from '@nestjs/swagger';

export class UserDetailsFilterDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
