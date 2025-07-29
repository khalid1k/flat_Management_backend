import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Otp {
  
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column()
  @Index()
  email: string;

  @Column()
  otpHash: string;

  @Index()
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAttemptAt: Date | null;
  
  @Index()
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

}