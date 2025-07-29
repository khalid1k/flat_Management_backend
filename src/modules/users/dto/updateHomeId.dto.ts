import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateHomeIdDto {
  @ApiProperty({
    description: 'The new home ID to associate with the user',
    example: '5678907888',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 64)
  homeId: number;
}