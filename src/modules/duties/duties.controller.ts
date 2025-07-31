import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase.guard'
import { Roles } from '../../decorator/roles.decorator';
import { CurrentUser } from '../../decorator/getCurrentUser.decorator';
import { User } from '../users/entities/user.entity';
import { DutiesService } from '../duties/duties.service';
import { CreateDutyDto } from '../duties/dto/createDuty.dto';
import { CompleteDutyDto } from '../duties/dto/completeDuty.dto';
import { RejectDutyDto } from './dto/rejectDuty.dto';
import { AssignDutyDto } from './dto/assignedDuty.dto';
import { DutyResponseDto } from './dto/responseDuty.dto';
import {Role} from '../../common/enums/roles.enum'
import { Duty } from './entities/duty.entity';

@ApiTags('Duties')
@ApiBearerAuth()
@Controller('duties')
export class DutiesController {
  constructor(private readonly dutiesService: DutiesService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new duty' })
  @ApiResponse({ 
    status: 201, 
    description: 'Duty created successfully',
    type: DutyResponseDto
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createDutyDto: CreateDutyDto,
    @Query() assignDutyDto: AssignDutyDto,
    @CurrentUser() adminUser: User
  ): Promise<DutyResponseDto> {
    const duty = await this.dutiesService.createDuty(
      createDutyDto,
      adminUser,
      { id: assignDutyDto.userId } as User
    );
    return this.mapToResponseDto(duty);
  }

  @Post(':id/complete')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('evidence'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CompleteDutyDto })
  @ApiOperation({ summary: 'Complete a duty with evidence' })
  @ApiResponse({ 
    status: 200, 
    description: 'Duty completed successfully',
    type: DutyResponseDto
  })
  @ApiResponse({ status: 404, description: 'Duty not found' })
  async complete(
    @Param('id', ParseIntPipe) dutyId: number,
    @UploadedFile() evidenceFile: Express.Multer.File,
    @Body() completeDutyDto: CompleteDutyDto,
    @CurrentUser() user: User
  ): Promise<DutyResponseDto> {
    const duty = await this.dutiesService.completeDuty(
      dutyId,
      evidenceFile,
      completeDutyDto,
      user
    );
    return this.mapToResponseDto(duty);
  }

  @Post(':id/approve')
  @UseGuards(FirebaseAuthGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Approve a completed duty' })
  @ApiResponse({ 
    status: 200, 
    description: 'Duty approved successfully',
    type: DutyResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid duty state' })
  @ApiResponse({ status: 404, description: 'Duty not found' })
  async approve(
    @Param('id', ParseIntPipe) dutyId: number,
    @CurrentUser() adminUser: User
  ): Promise<DutyResponseDto> {
    const duty = await this.dutiesService.approveDuty(dutyId, adminUser);
    return this.mapToResponseDto(duty);
  }

  @Post(':id/reject')
  @UseGuards(FirebaseAuthGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Reject a completed duty' })
  @ApiResponse({ 
    status: 200, 
    description: 'Duty rejected successfully',
    type: DutyResponseDto
  })
  @ApiResponse({ status: 404, description: 'Duty not found' })
  async reject(
    @Param('id', ParseIntPipe) dutyId: number,
    @Body() rejectDutyDto: RejectDutyDto,
    @CurrentUser() adminUser: User
  ): Promise<DutyResponseDto> {
    const duty = await this.dutiesService.rejectDuty(
      dutyId,
      rejectDutyDto,
      adminUser
    );
    return this.mapToResponseDto(duty);
  }

  @Get('user/:userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Get all duties for a user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user duties',
    type: [DutyResponseDto]
  })
  async getUserDuties(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<DutyResponseDto[]> {
    const duties = await this.dutiesService.getUserDuties(userId);
    return duties.map(duty => this.mapToResponseDto(duty));
  }

  @Get(':id/history')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Get duty history' })
  @ApiResponse({ 
    status: 200, 
    description: 'Duty with history records'
  })
  async getHistory(
    @Param('id', ParseIntPipe) dutyId: number
  ) {
    return this.dutiesService.getDutyWithHistory(dutyId);
  }

  private mapToResponseDto(duty: Duty): DutyResponseDto {
    return {
      id: duty.id,
      title: duty.title,
      description: duty.description,
      status: duty.status,
      dueDate: duty.dueDate,
      evidenceUrl: duty.evidenceUrl,
      assignedTo: duty.assignedTo.id
    };
  }
}