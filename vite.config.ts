import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd());
  
  // Log loaded environment variables (excluding sensitive values)
  console.log('Loaded environment variables:', 
    Object.keys(env).reduce((acc, key) => {
      acc[key] = key.includes('KEY') || key.includes('SECRET') ? '[REDACTED]' : env[key];
      return acc;
    }, {} as Record<string, string>)
  );

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // Make env variables available
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      'process.env': env
    }
  };
});
