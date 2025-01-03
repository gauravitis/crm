import { Resend } from 'resend';

// Try to get the API key from different environment variables
const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

if (!apiKey) {
  console.error('No Resend API key found in environment variables');
}

// Initialize Resend with error checking
const resend = new Resend(apiKey);

// Allowed origins
const allowedOrigins = [
  'https://crm-gamma-seven.vercel.app',
  'https://crm.chembiolifescience.com',
  'http://localhost:3000'
];

export default async function handler(req, res) {
  console.log('API Route Handler Called', { method: req.method });

  // Get the request origin
  const origin = req.headers.origin;
  
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'OK' });
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Processing email request');
    const { to, quotationRef, clientName, documentData, filename, fromName } = req.body;

    if (!to || !quotationRef || !documentData) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(documentData, 'base64');

    console.log('Sending email to:', to);
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

    console.log('Email sent successfully:', response);
    return res.status(200).json({ message: 'Email sent successfully', data: response });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      message: 'Failed to send email', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
