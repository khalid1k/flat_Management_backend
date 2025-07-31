import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class AssignDutyDto {
  @ApiProperty({
    example: 2,
    description: 'ID of user to assign the duty to'
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
