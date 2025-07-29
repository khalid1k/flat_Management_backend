import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserService } from './services/users.service';
import { User } from './entities/user.entity';
import { FirebaseConfig } from 'src/config/firebase.config';
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UserService, FirebaseConfig],
  exports: [UserService, FirebaseConfig],
})
export class UsersModule {}
