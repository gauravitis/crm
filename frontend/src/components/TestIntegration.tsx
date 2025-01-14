import React from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logError } from '../config/sentry';

export const TestIntegration: React.FC = () => {
  const testFirebase = async () => {
    try {
      // Test Firebase
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Test message',
        timestamp: new Date()
      });
      console.log('Document written with ID: ', docRef.id);
      alert('Firebase test successful! Check console for document ID');
    } catch (error) {
      console.error('Firebase test failed:', error);
      logError(error instanceof Error ? error : new Error('Firebase test failed'));
      alert('Firebase test failed! Check console for details');
    }
  };

  const testSentry = () => {
    try {
      // Intentionally throw an error to test Sentry
      throw new Error('Test error for Sentry');
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Sentry test failed'));
      alert('Sentry test error sent! Check your Sentry dashboard');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Integration Tests</h2>
      <div className="space-x-4">
        <button
          onClick={testFirebase}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Firebase
        </button>
        <button
          onClick={testSentry}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Test Sentry
        </button>
      </div>
    </div>
  );
};
