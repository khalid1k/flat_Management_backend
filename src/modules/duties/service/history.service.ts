import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DutyHistory } from '../entities/dutyHistory.entity';
import { Duty } from '../entities/duty.entity';
import { User } from '../../users/entities/user.entity';
import { DutyStatus } from 'src/common/enums/dutyStatus.enum';

@Injectable()
export class DutyHistoryService {
  constructor(
    @InjectRepository(DutyHistory)
    private dutyHistoryRepository: Repository<DutyHistory>
  ) {}

  async recordHistory(
    duty: Duty,
    status: DutyStatus,
    user: User,
    comments?: string
  ): Promise<DutyHistory> {
    const history = this.dutyHistoryRepository.create({
      duty,
      status,
      changedBy: user,
      comments
    });

    return this.dutyHistoryRepository.save(history);
  }
}