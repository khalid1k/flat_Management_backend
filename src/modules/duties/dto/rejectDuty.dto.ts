import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RejectDutyDto {
  @ApiProperty({
    example: 'Incomplete evidence provided',
    description: 'Reason for rejection'
  })
  @IsString()
  @IsNotEmpty()
  comments: string;
}