import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async deleteOtpsForEmail(email: string): Promise<void> {
    await this.otpRepository.delete({ email });
  }

  async cleanupExpiredOtps(): Promise<number> {
    const result = await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    return result.affected || 0;
  }

  async createOtp(email: string): Promise< string > {
    await this.cleanupExpiredOtps(); 
    await this.deleteOtpsForEmail(email);
    
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const encryptedOtp = await bcrypt.hash(otp, 10);
    
    await this.otpRepository.save({
      email,
      otpHash: encryptedOtp,
      expiresAt,
      attempts: 0,
      lastAttemptAt: null,
    });

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    await this.cleanupExpiredOtps();
    
    const otpRecord = await this.otpRepository.findOne({ 
      where: { email },
      order: { createdAt: 'DESC' }
    });

    if (!otpRecord) return false;
    if (new Date() > otpRecord.expiresAt) return false;
    if (otpRecord.attempts >= 5) return false;

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    
    if (!isValid) {
      await this.otpRepository.update(otpRecord.id, {
        attempts: otpRecord.attempts + 1,
        lastAttemptAt: new Date(),
      });
      return false;
    }

    await this.deleteOtpsForEmail(email);
    return true;
  }

  async canResendOtp(email: string): Promise<boolean> {
    await this.cleanupExpiredOtps();
    
    const lastOtp = await this.otpRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' }
    });

    if (!lastOtp) return true;

    return new Date().getTime() - lastOtp.createdAt.getTime() > 60000;
  }

  async isRateLimited(email: string): Promise<boolean> {
    await this.cleanupExpiredOtps();
    
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.otpRepository.count({
      where: {
        email,
        createdAt: MoreThan(lastHour),
        attempts: MoreThan(3),
      },
    });
    return count >= 5;
  }
}