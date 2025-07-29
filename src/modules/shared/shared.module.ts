import { Module } from '@nestjs/common';
import { AwsService } from './aws/aws.service';
import { AwsS3Service } from './aws/awsS3.Service';

@Module({
  imports: [],
  providers: [AwsService, AwsS3Service],
  exports: [AwsS3Service],
})
export class SharedModule {}
