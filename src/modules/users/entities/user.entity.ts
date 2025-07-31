import { Entity, Column, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../models/customBase.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { Duty } from '../../duties/entities/duty.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { LoanHistory } from '../../loan/entities/loanHistory.entity';
import { DutyHistory } from '../../duties/entities/dutyHistory.entity';
import { Role } from '../../../common/enums/roles.enum';

@Entity()
export class User extends CustomBaseEntity {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ unique: true })
  firebaseId: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ default: Role.User })
  role: Role;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  // Loans given to others
  @OneToMany(() => Loan, (loan) => loan.lender)
  loansGiven: Loan[];

  // Loans taken from others
  @OneToMany(() => Loan, (loan) => loan.borrower)
  loansTaken: Loan[];

  // Duties assigned to this user
  @OneToMany(() => Duty, (duty) => duty.assignedTo)
  duties: Duty[];

  // Notifications received
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Loan history records created by this user
  @OneToMany(() => LoanHistory, (history) => history.changedBy)
  loanHistories: LoanHistory[];

  // Duty history records created by this user
  @OneToMany(() => DutyHistory, (history) => history.changedBy)
  dutyHistories: DutyHistory[];
}