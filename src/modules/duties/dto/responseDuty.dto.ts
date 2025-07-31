import { ApiProperty } from '@nestjs/swagger';
import { DutyStatus } from 'src/common/enums/dutyStatus.enum';

export class DutyResponseDto {
  @ApiProperty({ example: 1, description: 'Duty ID' })
  id: number;

  @ApiProperty({ example: 'Clean common area', description: 'Duty title' })
  title: string;

  @ApiProperty({ 
    required: false,
    example: 'Vacuum and mop the living room',
    description: 'Duty description'
  })
  description?: string;

  @ApiProperty({ 
    enum: DutyStatus,
    example: DutyStatus.PENDING,
    description: 'Current status of the duty'
  })
  status: DutyStatus;

  @ApiProperty({ 
    required: false,
    example: '2023-12-31',
    description: 'Due date for the duty'
  })
  dueDate?: Date;

  @ApiProperty({ 
    required: false,
    example: 'https://s3.amazonaws.com/bucket/evidence.jpg',
    description: 'URL of completion evidence'
  })
  evidenceUrl?: string;

  @ApiProperty({ example: 2, description: 'ID of assigned user' })
  assignedTo: number;
}