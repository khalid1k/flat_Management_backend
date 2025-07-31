import { Module } from '@nestjs/common';
import { DutiesService } from './duties.service';
import { DutyHistory } from './entities/dutyHistory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Duty } from './entities/duty.entity';
import { DutiesController } from './duties.controller';
import { SharedModule } from '../shared/shared.module';
import { NotificationModule } from '../notification/notification.module';
import { DutyHistoryService } from './service/history.service';
import { FirebaseConfig } from 'src/config/firebase.config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([DutyHistory, Duty]), SharedModule, NotificationModule, UsersModule],
  providers: [DutiesService, DutyHistoryService, FirebaseConfig],
  controllers: [DutiesController]
})
export class DutiesModule {}
