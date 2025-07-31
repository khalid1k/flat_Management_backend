import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Duty } from './entities/duty.entity';
import { User } from '../users/entities/user.entity';
import { AwsS3Service } from '../shared/aws/awsS3.Service';
import { DutyHistoryService } from '../duties/service/history.service';
import { DutyStatus } from '../../common/enums/dutyStatus.enum';
import { NotificationsService } from '../notification/notification.service';
import { CreateDutyDto } from '../duties/dto/createDuty.dto';
import { CompleteDutyDto } from '../duties/dto/completeDuty.dto';
import { RejectDutyDto } from '../duties/dto/rejectDuty.dto';
import { NotificationType } from 'src/common/enums/notificationType.enum';

@Injectable()
export class DutiesService {
  constructor(
    @InjectRepository(Duty)
    private dutyRepository: Repository<Duty>,
    private s3Service: AwsS3Service,
    private dutyHistoryService: DutyHistoryService,
    private notificationsService: NotificationsService
  ) {}

  async createDuty(
    createDutyDto: CreateDutyDto,
    adminUser: User,
    assignedTo: User
  ): Promise<Duty> {
    const duty = this.dutyRepository.create({
      ...createDutyDto,
      assignedTo,
      status: DutyStatus.PENDING
    });

    const savedDuty = await this.dutyRepository.save(duty);

    await this.dutyHistoryService.recordHistory(
      savedDuty,
      DutyStatus.PENDING,
      adminUser,
      'Duty created'
    );

    await this.notificationsService.createUserNotification(
      assignedTo.firebaseId,
      NotificationType.DUTY_ASSIGNED,
      `You have been assigned a new duty: ${savedDuty.title}`,
      { dutyId: savedDuty.id }
    );

    return savedDuty;
  }

  async completeDuty(
    dutyId: number,
    file: Express.Multer.File,
    completeDutyDto: CompleteDutyDto,
    user: User
  ): Promise<Duty> {
    const duty = await this.dutyRepository.findOne({
      where: { id: dutyId, assignedTo: user },
      relations: ['assignedTo']
    });

    if (!duty) {
      throw new NotFoundException('Duty not found or not assigned to you');
    }

    const uploadResultLocation = await this.s3Service.uploadFile(file);

    duty.evidenceUrl = uploadResultLocation;
    duty.status = DutyStatus.PENDING_APPROVAL;
    await this.dutyRepository.save(duty);

    await this.dutyHistoryService.recordHistory(
      duty,
      DutyStatus.PENDING_APPROVAL,
      user,
      completeDutyDto.comments || 'Duty completed, pending approval'
    );

    await this.notificationsService.createAdminNotification(
      NotificationType.DUTY_COMPLETED,
      `${user.name} completed duty: ${duty.title}`,
      { 
        dutyId,
        evidenceUrl: uploadResultLocation
      }
    );

    return duty;
  }

  async approveDuty(dutyId: number, adminUser: User): Promise<Duty> {
    const duty = await this.dutyRepository.findOne({
      where: { id: dutyId },
      relations: ['assignedTo']
    });

    if (!duty) {
      throw new NotFoundException('Duty not found');
    }

    if (duty.status !== DutyStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Duty is not in pending approval state');
    }

    duty.status = DutyStatus.APPROVED;
    await this.dutyRepository.save(duty);

    await this.dutyHistoryService.recordHistory(
      duty,
      DutyStatus.APPROVED,
      adminUser,
      'Duty approved by admin'
    );

    await this.notificationsService.createUserNotification(
      duty.assignedTo.firebaseId,
      NotificationType.DUTY_APPROVED,
      `Your duty "${duty.title}" was approved by admin`,
      { dutyId }
    );

    return duty;
  }

  async rejectDuty(
    dutyId: number,
    rejectDutyDto: RejectDutyDto,
    adminUser: User
  ): Promise<Duty> {
    const duty = await this.dutyRepository.findOne({
      where: { id: dutyId },
      relations: ['assignedTo']
    });

    if (!duty) {
      throw new NotFoundException('Duty not found');
    }

    duty.status = DutyStatus.REJECTED;
    await this.dutyRepository.save(duty);

    await this.dutyHistoryService.recordHistory(
      duty,
      DutyStatus.REJECTED,
      adminUser,
      rejectDutyDto.comments
    );

    await this.notificationsService.createUserNotification(
      duty.assignedTo.firebaseId,
      NotificationType.DUTY_REJECTED,
      `Your duty "${duty.title}" was rejected: ${rejectDutyDto.comments}`,
      { dutyId }
    );

    return duty;
  }

  async getUserDuties(userId: number): Promise<Duty[]> {
    return this.dutyRepository.find({
      where: { assignedTo: { id: userId } },
      order: { dueDate: 'ASC' }
    });
  }

  async getDutyWithHistory(dutyId: number): Promise<Duty> {
    const result = await this.dutyRepository.findOne({
      where: { id: dutyId },
      relations: ['history', 'history.changedBy']
    });
    if(!result){
      throw new HttpException("No duty history found aginst this duty id", HttpStatus.NOT_FOUND)
    }
    return result;
  }
}