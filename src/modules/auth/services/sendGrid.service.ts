import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendGridService {
  constructor(private configService: ConfigService) {
     const apiKey = this.configService.get('SENDGRID_API_KEY');
     if (!apiKey) {
       throw new Error('SendGrid API key is missing in configuration');
     }
     sgMail.setApiKey(apiKey);
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    const msg = {
      to,
      from: this.configService.get('EMAIL_FROM'), 
      subject,
      text,
      html: html || this.textToHtml(text),
      mailSettings: {
        sandboxMode: {
          enable: false 
        }
      },
      trackingSettings: {
        clickTracking: {
          enable: false
        },
        openTracking: {
          enable: false 
        }
      }
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('SendGrid error details:', {
        statusCode: error.code,
        body: error.response?.body,
        headers: error.response?.headers,
        message: error.message
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private textToHtml(text: string): string {
    return `<p>${text.replace(/\n/g, '<br>')}</p>`;
  }
}