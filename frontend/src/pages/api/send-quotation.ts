import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, quotationRef, clientName, documentData, filename, fromName } = req.body;

    if (!to || !quotationRef || !documentData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(documentData, 'base64');

    const response = await resend.emails.send({
      from: `${fromName || 'CBL'} <quotations@cbl.com>`,
      to: [to],
      subject: `Quotation ${quotationRef} from CBL`,
      html: `
        <div>
          <p>Dear ${clientName},</p>
          <p>Please find attached the quotation ${quotationRef} for your reference.</p>
          <p>If you have any questions or need clarification, please don't hesitate to contact us.</p>
          <br/>
          <p>Best regards,</p>
          <p>${fromName || 'CBL Team'}</p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: buffer
        }
      ]
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email' });
  }
}
