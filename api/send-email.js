import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Allowed origins
const allowedOrigins = [
  'https://crm-gamma-seven.vercel.app',
  'https://crm.chembiolifescience.com',
  'http://localhost:3000'
];

export default async function handler(req, res) {
  // Get the request origin
  const origin = req.headers.origin;
  
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
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
          filename: filename || `Quotation_${quotationRef}.pdf`,
          content: buffer
        }
      ]
    });

    res.status(200).json({ message: 'Email sent successfully', data: response });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
