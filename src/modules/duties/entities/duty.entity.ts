import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../models/customBase.entity';
import { User } from '../../users/entities/user.entity';
import { DutyStatus } from 'src/common/enums/dutyStatus.enum';
import { DutyHistory } from './dutyHistory.entity';

@Entity()
export class Duty extends CustomBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: DutyStatus, default: DutyStatus.PENDING })
  status: DutyStatus;

  @ManyToOne(() => User, (user) => user.duties)
  assignedTo: User;

  @Column({ nullable: true })
  evidenceUrl: string; // S3 URL

  @Column({ nullable: true })
  dueDate: Date;

  @OneToMany(() => DutyHistory, (history) => history.duty)
  history: DutyHistory[];
}