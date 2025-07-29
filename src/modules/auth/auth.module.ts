import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { FirebaseConfig } from 'src/config/firebase.config';
import { SendGridService } from './services/sendGrid.service';
import { OtpService } from './services/otp.service';
import { Otp } from './entities/otp.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Otp]), UsersModule],
  providers: [AuthService, FirebaseConfig, OtpService, SendGridService],
  controllers: [AuthController],
})
export class AuthModule {}
