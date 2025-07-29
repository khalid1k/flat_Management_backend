import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseConfig } from 'src/config/firebase.config';
import { UserService } from '../../users/services/users.service';
import { OtpService } from './otp.service';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { SendGridService } from './sendGrid.service';

@Injectable()
export class AuthService {
  constructor(
    private firebaseConfig: FirebaseConfig,
    private userService: UserService,
    private SendGridService: SendGridService,
    private otpService: OtpService,
  ) {}

  async startEmailOtp(email: string) {
    if (!this.validateEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const isRateLimited = await this.otpService.isRateLimited(email);

    if (isRateLimited) {
      throw new HttpException(
        'Too many OTP requests. Please wait before trying again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = await this.otpService.createOtp(email);

    try {
      await this.SendGridService.sendEmail(
        email,
        'Your OTP Code',
        `Your OTP code is: ${otp}`,
         this.generateOtpHtmlTemplate(otp),
      );
    } catch(error) {
      await this.otpService.deleteOtpsForEmail(email);
      throw new HttpException(
        'Failed to send OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return SuccessResponse.create(HttpStatus.OK, 'OTP code sent to email', { 
      success: true,
    });
  }

  async resendEmailOtp(email: string) {
    if (!this.validateEmail(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const canResend = await this.otpService.canResendOtp(email);
    if (!canResend) {
      throw new HttpException(
        'Please wait before requesting a new OTP',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (await this.otpService.isRateLimited(email)) {
      throw new HttpException(
        'Too many OTP requests. Please wait before trying again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.startEmailOtp(email);
  }

  async verifyEmailOtp(email: string, otp: string) {
    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.ensureUserExists(email);

    const customToken = await this.firebaseConfig.auth.createCustomToken(
      user.firebaseId,
    );
     
    return SuccessResponse.create(HttpStatus.OK, 'OTP verified successfully', {
      customToken,
      user: this.userService.sanitizeUser(user),
    });
  }

  async verifyFirebaseToken(idToken: string) {
    try {
      return await this.firebaseConfig.auth.verifyIdToken(idToken);
    } catch (error) {
      throw new HttpException(
        'Invalid Firebase token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async handleSocialLogin(idToken: string) {
    const firebaseUser = await this.verifyFirebaseToken(idToken);

    const user = await this.userService.createOrUpdateUser({
      firebaseId: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.name || firebaseUser.email?.split('@')[0],
    });
   
    return SuccessResponse.create(HttpStatus.OK,'Social login successful', {
      user: this.userService.sanitizeUser(user),
    });

  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }


   private generateOtpHtmlTemplate(otp: string): string {
   return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Your Verification Code</h2>
      <p>Please use the following code to verify your account:</p>
      <div style="font-size: 24px; letter-spacing: 3px; 
           font-weight: bold; margin: 20px 0; color: #2563eb;">
        ${otp}
      </div>
      <p>This code will expire in 2 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
}
}
