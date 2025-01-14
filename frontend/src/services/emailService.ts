import { config } from '../config';

class EmailService {
  async sendQuotation(options: {
    to: string;
    cc?: string;
    bcc?: string;
    quotationRef: string;
    clientName: string;
    documentData: string;
    filename: string;
    fromName?: string;
  }) {
    try {
      const response = await fetch(`${config.apiBaseUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
