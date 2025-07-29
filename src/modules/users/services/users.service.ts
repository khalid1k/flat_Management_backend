import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/createUser.dto';
import { FirebaseConfig } from 'src/config/firebase.config';
import { AwsS3Service } from 'src/modules/shared/aws/awsS3.Service';
import { UpdateUserProfileWithFileDto } from '../dto/updateUserProfile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private firebaseConfig: FirebaseConfig,
    private awsS3Service: AwsS3Service,
  ) {}

  async createOrUpdateUser(userData: CreateUserDto) {
    let user = await this.findByFirebaseId(userData.firebaseId);

    if (!user) {
      user = this.userRepository.create({
        firebaseId: userData.firebaseId,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      });
    } else {
      if (userData.email) user.email = userData.email;
      if (userData.name) user.name = userData.name;
      if (userData.picture) user.picture = userData.picture;
    }

    return this.userRepository.save(user);
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByFirebaseId(firebaseId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { firebaseId } });
  }

  async updateEmail(firebaseId: string, newEmail: string): Promise<Partial<User>> {
    const user = await this.findByFirebaseId(firebaseId);
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.email === newEmail) {
      return this.sanitizeUser(user);
    }
  
    const existingUserWithEmail = await this.findByEmail(newEmail);
    if (existingUserWithEmail && existingUserWithEmail.firebaseId !== firebaseId) {
      throw new HttpException('Email already in use by another account', HttpStatus.CONFLICT);
    }
  
    user.email = newEmail;

    try{
      const updatedUser = await this.userRepository.save(user);
      return this.sanitizeUser(updatedUser);
    } catch (error) {
      throw new HttpException('Failed to update Email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }


  sanitizeUser(user: User): Partial<User> {
    const { createdAt, updatedAt,...sanitizedUser } = user;
    return sanitizedUser;
  }


  async ensureUserExists(email: string): Promise<User> {
    let user = await this.findByEmail(email);

    if (!user) {
      let firebaseUser;

      try {
        try {
          firebaseUser = await this.firebaseConfig.auth.getUserByEmail(email);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            firebaseUser = await this.firebaseConfig.auth.createUser({
              email,
              emailVerified: true,
              disabled: false,
            });
          } else {
            throw error;
          }
        }
        user = await this.userRepository.save({
          firebaseId: firebaseUser.uid,
          email,
          name: email.split('@')[0],
        });

        return user;
      } catch (error) {
        if (firebaseUser && !user) {
          await this.firebaseConfig.auth.deleteUser(firebaseUser.uid)
            .catch(cleanupError => console.error('Firebase cleanup failed:', cleanupError));
        }
        throw new HttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return user;
  }


  async updateProfile(
    firebaseId: string,
    updateData: UpdateUserProfileWithFileDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findByFirebaseId(firebaseId);
    if(!user){
      throw new HttpException("User not found against this firebaseId!", HttpStatus.NOT_FOUND)
    }

    if (updateData.name) {
      user.name = updateData.name;
    }

    if (file) {
      try {
        if (user.picture) {
          await this.awsS3Service.deleteFile(user.picture).catch(() => {
            console.error('Failed to delete old profile picture');
          });
        }
        user.picture = await this.awsS3Service.uploadFile(file);
      } catch (error) {
        throw new HttpException('Failed to upload profile picture', HttpStatus.INTERNAL_SERVER_ERROR, error);
      }
    }

    return this.userRepository.save(user);
  }
}