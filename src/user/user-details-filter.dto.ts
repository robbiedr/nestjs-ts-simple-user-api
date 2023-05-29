import { ApiProperty } from '@nestjs/swagger';

export class UserDetailsFilterDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 'john', required: false })
  search?: string;

  @ApiProperty({
    example: 'createdAt',
    description: 'Sorting field',
    enum: ['createdAt', 'firstName', 'lastName', 'email'],
    required: false,
  })
  sort?: 'createdAt' | 'firstName' | 'lastName' | 'email';

  @ApiProperty({
    example: 'DESC',
    description: 'Sorting order',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  sortOrder?: 'ASC' | 'DESC';
}
