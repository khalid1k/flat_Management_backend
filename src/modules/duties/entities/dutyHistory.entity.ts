import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Duty } from './duty.entity';
import { User } from '../../users/entities/user.entity';
import { DutyStatus } from 'src/common/enums/dutyStatus.enum';

@Entity()
export class DutyHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Duty, duty => duty.history)
  duty: Duty;

  @Column({ type: 'enum', enum: DutyStatus })
  status: DutyStatus;

  @Column({ nullable: true })
  comments?: string;

  @ManyToOne(() => User)
  changedBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}