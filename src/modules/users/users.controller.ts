import { Controller, Put, Post, Body, UseGuards, HttpStatus, HttpException, Req,
    UseInterceptors, UploadedFile, Patch
 } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserService } from './services/users.service';
import { UpdateEmailDto } from './dto/updateEmail.dto';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { ErrorResponse } from 'src/common/dto/response.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase.guard';
import { CurrentUser } from 'src/decorator/getCurrentUser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserProfileWithFileDto } from './dto/updateUserProfile.dto';
import { User } from './entities/user.entity';
@ApiTags('Users')
@ApiBearerAuth('firebase-auth')
@Controller('users')
// @UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Put('update-email')
  @ApiOperation({
    summary: 'Update user email',
    description:
      'Updates the email address for the specified user. The email must be unique across all users.',
  })
  @ApiBody({
    description: 'Email update request payload',
    schema: {
      example: {
        newEmail: 'new.user@example.com',
      },
      properties: {
        newEmail: {
          type: 'string',
          format: 'email',
          description: 'The new email address to update',
          example: 'new.user@example.com',
        },
      },
      required: ['newEmail'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email updated successfully',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponse,
  })
  async updateEmail(
    @Req() request,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {

    const firebaseId = request.userFirebaseId; 
    
    if (!firebaseId) {
      throw new HttpException('Unauthorized - Missing user ID', HttpStatus.UNAUTHORIZED);
    }
    
    const sanitizedUser = await this.userService.updateEmail(
      firebaseId,
      updateEmailDto.newEmail,
    );
    return SuccessResponse.create(HttpStatus.OK,'Email updated successfully', sanitizedUser);
  }

  @Patch('/profile')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update user name and/or profile picture',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update user profile data',
    type: UpdateUserProfileWithFileDto,
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: UpdateUserProfileWithFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try{
      const res = await this.userService.updateProfile(user.firebaseId, updateData, file);
      return SuccessResponse.create(HttpStatus.OK, "Profile is updated successfully!", res);
    }catch(error){
      throw new HttpException("Error while updating the profile ",HttpStatus.INTERNAL_SERVER_ERROR, error)
    }
  }
  
}
