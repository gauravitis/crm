import React from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default ErrorBoundary;
