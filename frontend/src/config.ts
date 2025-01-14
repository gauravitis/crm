interface Config {
  resend: {
    apiKey: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  sentry: {
    dsn: string;
  };
  apiBaseUrl: string;
}

// Debug: Log all environment variables
console.log('Raw environment variables:', {
  resendKey: import.meta.env.VITE_RESEND_API_KEY,
  allEnv: { ...import.meta.env }
});

// Try alternative ways to access env variables
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || 
                      (typeof window !== 'undefined' ? window.__ENV__?.VITE_RESEND_API_KEY : undefined);

export const config: Config = {
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://crm-api-xi.vercel.app/api'  
    : 'http://localhost:3001/api',
  resend: {
    apiKey: import.meta.env.VITE_RESEND_API_KEY || '',
  },
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
  },
};

// Validate config
const validateConfig = () => {
  console.log('Config validation starting...');
  const missingVars: string[] = [];

  // Check each variable and log its presence
  console.log('Checking Resend API Key:', {
    exists: !!config.resend.apiKey,
    value: config.resend.apiKey ? '[REDACTED]' : 'missing'
  });

  if (!config.resend.apiKey) missingVars.push('VITE_RESEND_API_KEY');
  if (!config.firebase.apiKey) missingVars.push('VITE_FIREBASE_API_KEY');
  if (!config.firebase.authDomain) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!config.firebase.projectId) missingVars.push('VITE_FIREBASE_PROJECT_ID');
  if (!config.firebase.storageBucket) missingVars.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!config.firebase.messagingSenderId) missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!config.firebase.appId) missingVars.push('VITE_FIREBASE_APP_ID');
  if (!config.sentry.dsn) missingVars.push('VITE_SENTRY_DSN');

  console.log('Config validation results:', {
    missingVariables: missingVars,
    currentConfig: {
      apiBaseUrl: config.apiBaseUrl,
      resend: { apiKey: config.resend.apiKey ? '[REDACTED]' : 'missing' },
      firebase: {
        apiKey: config.firebase.apiKey ? '[REDACTED]' : 'missing',
        authDomain: config.firebase.authDomain || 'missing',
        projectId: config.firebase.projectId || 'missing',
        storageBucket: config.firebase.storageBucket || 'missing',
        messagingSenderId: config.firebase.messagingSenderId || 'missing',
        appId: config.firebase.appId || 'missing',
      },
      sentry: { dsn: config.sentry.dsn ? '[REDACTED]' : 'missing' },
    }
  });

  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
  } else {
    console.log('All required environment variables are present');
  }
};

validateConfig();

export default config;
