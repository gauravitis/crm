import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Email Configuration
const EMAIL_CONFIG = {
    defaultSender: {
        name: 'CBL Quotations',
        // Always use test email for now until domain is verified
        email: 'onboarding@resend.dev'
    },
    replyTo: process.env.VITE_REPLY_TO_EMAIL
};

// Validate required environment variables
const REQUIRED_ENV_VARS = ['VITE_RESEND_API_KEY'];
const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
}

const app = express();
const port = 3001;

// Initialize Resend
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test-email', async (req, res) => {
    try {
        console.log('Sending test email...');
        const response = await resend.emails.send({
            from: EMAIL_CONFIG.defaultSender.email,
            to: 'delivered@resend.dev',
            subject: 'Test Email',
            html: '<p>This is a test email from the server.</p>'
        });
        console.log('Test email sent successfully:', response);
        res.json({ success: true, response });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.response?.data
        });
    }
});

app.post('/api/send-email', async (req, res) => {
    try {
        const { to, quotationRef, clientName, documentData, filename, fromName } = req.body;

        if (!to || !quotationRef || !documentData) {
            console.error('Missing required fields:', {
                hasTo: !!to,
                hasQuotationRef: !!quotationRef,
                hasDocumentData: !!documentData
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const emailData = {
            from: `${fromName || EMAIL_CONFIG.defaultSender.name} <${EMAIL_CONFIG.defaultSender.email}>`,
            reply_to: EMAIL_CONFIG.replyTo,
            to: [to],
            subject: `Quotation ${quotationRef} from ${fromName || EMAIL_CONFIG.defaultSender.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <p>Dear ${clientName},</p>
                    <p>Please find attached the quotation ${quotationRef} for your reference.</p>
                    <p>If you have any questions or need clarification, please don't hesitate to contact us.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>${fromName || EMAIL_CONFIG.defaultSender.name}</p>
                </div>
            `,
            attachments: [{
                filename: filename || `Quotation-${quotationRef}.pdf`,
                content: documentData
            }]
        };

        console.log('Sending email with configuration:', {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            replyTo: emailData.reply_to
        });

        const response = await resend.emails.send(emailData);
        
        console.log('Email sent successfully:', {
            id: response.id,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            messageId: response.id
        });
    } catch (error) {
        console.error('Failed to send email:', {
            error: error.message,
            name: error.name,
            response: error.response?.data,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Email configuration:', {
        sender: EMAIL_CONFIG.defaultSender,
        replyTo: EMAIL_CONFIG.replyTo || 'Not configured'
    });
});
