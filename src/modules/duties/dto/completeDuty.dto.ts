// src/duties/dto/complete-duty.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompleteDutyDto {
  @ApiProperty({
    required: false,
    example: 'Completed all tasks',
    description: 'Comments about completion'
  })
  @IsString()
  @IsOptional()
  comments?: string;
}
