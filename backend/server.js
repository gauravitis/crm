import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

// Initialize Express app
const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email Configuration
const EMAIL_CONFIG = {
    defaultSender: {
        name: 'CBL Quotations',
        email: process.env.SENDER_EMAIL || 'support@chembiolifescience.com'
    },
    replyTo: process.env.REPLY_TO_EMAIL || 'support@chembiolifescience.com'
};

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://crm-gamma-seven.vercel.app',
            'https://crm-gamma-seven.vercel.app',
            'http://crm-kngv01b2e-gauravs-projects-0289b446.vercel.app',
            'https://crm-kngv01b2e-gauravs-projects-0289b446.vercel.app'
        ];
        
        // Check if the origin is allowed
        if(allowedOrigins.indexOf(origin) === -1) {
            console.log('Request from origin:', origin);
            // Allow all Vercel preview deployments
            if(origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }
        }
        
        callback(null, true);
    },
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Root route handler
app.get('/', (req, res) => {
    res.json({ 
        message: 'CBL API Server',
        status: 'running',
        endpoints: {
            health: '/health',
            sendEmail: '/api/send-email',
            testEmail: '/api/test-email'
        }
    });
});

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
        const { to, cc, bcc, quotationRef, clientName, documentData, filename, fromName } = req.body;

        if (!to || !quotationRef || !documentData) {
            console.error('Missing required fields:', {
                hasTo: !!to,
                hasQuotationRef: !!quotationRef,
                hasDocumentData: !!documentData
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Helper function to process email addresses
        const processEmails = (emails) => {
            if (!emails) return undefined;
            if (Array.isArray(emails)) return emails;
            return emails.split(',').map(email => email.trim()).filter(email => email);
        };

        const emailData = {
            from: `${fromName || EMAIL_CONFIG.defaultSender.name} <${EMAIL_CONFIG.defaultSender.email}>`,
            reply_to: EMAIL_CONFIG.replyTo,
            to: processEmails(to),
            ...(cc && { cc: processEmails(cc) }),
            ...(bcc && { bcc: processEmails(bcc) }),
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
            cc: emailData.cc,
            bcc: emailData.bcc,
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message
    });
});

// 404 handler - must be last
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ 
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`,
        availableEndpoints: {
            health: '/health',
            sendEmail: '/api/send-email',
            testEmail: '/api/test-email'
        }
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = 3001;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('Email configuration:', {
            sender: EMAIL_CONFIG.defaultSender,
            replyTo: EMAIL_CONFIG.replyTo || 'Not configured'
        });
    });
}

// Export the Express app for Vercel
export default app; 