import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserService } from './services/users.service';
import { User } from './entities/user.entity';
import { FirebaseConfig } from 'src/config/firebase.config';
import { SharedModule } from '../shared/shared.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), SharedModule],
  controllers: [UsersController],
  providers: [UserService, FirebaseConfig],
  exports: [UserService, FirebaseConfig],
})
export class UsersModule {}
