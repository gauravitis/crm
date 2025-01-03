const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Resend } = require('resend');

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'https://crm-gamma-seven.vercel.app',
  'https://crm.chembiolifescience.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email endpoint
app.post('/api/send-email', async (req, res) => {
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

    res.json({ message: 'Email sent successfully', data: response });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
