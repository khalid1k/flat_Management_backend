import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileWithFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture file (JPEG, PNG)',
    required: false,
  })
  @IsOptional()
  picture?: any;

  @ApiProperty({
    description: 'New name for the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}