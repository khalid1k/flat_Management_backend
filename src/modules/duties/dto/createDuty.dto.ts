import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateDutyDto {
  @ApiProperty({
    example: 'Clean common area',
    description: 'Title of the duty'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    required: false,
    example: 'Vacuum and mop the living room',
    description: 'Detailed description of the duty'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    required: false,
    example: '2023-12-31',
    description: 'Due date for the duty'
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;
}
