import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class FirebaseNotificationService {
  private readonly logger = new Logger(FirebaseNotificationService.name);

  async sendPushNotification(
    user: User,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    if (!user.fcmToken) {
      this.logger.warn(`No FCM token for user ${user.id}`);
      return;
    }

    try {
      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
        data,
      });
      this.logger.log(`Notification sent to user ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${user.id}`, error.stack);
    }
  }
}