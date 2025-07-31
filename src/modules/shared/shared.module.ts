import { Module } from '@nestjs/common';
import { AwsService } from './aws/aws.service';
import { AwsS3Service } from './aws/awsS3.Service';
import { FirebaseNotificationService } from './services/firebaseNotification.service';

@Module({
  imports: [],
  providers: [AwsService, AwsS3Service, FirebaseNotificationService],
  exports: [AwsS3Service, FirebaseNotificationService],
})
export class SharedModule {}
