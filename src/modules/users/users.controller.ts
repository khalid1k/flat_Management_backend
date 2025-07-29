import { Controller, Put, Post, Body, UseGuards, HttpStatus, HttpException, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './services/users.service';
import { UpdateEmailDto } from './dto/updateEmail.dto';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { ErrorResponse } from 'src/common/dto/response.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase.guard';
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
  
}
