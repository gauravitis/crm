import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Supabase configuration
const supabaseUrl = 'https://usydopzztlqyfaqrrcas.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeWRvcHp6dGxxeWZhcXJyY2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzM5Mjc0OSwiZXhwIjoyMDYyOTY4NzQ5fQ.JMBnNk8vg4sLVXfzdPRywG4fk3jf_dhGqhVXDytsIzo';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for user input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Collections to migrate
const collections = [
  { firebase: 'quotations', supabase: 'quotations' },
  { firebase: 'companies', supabase: 'companies' },
  { firebase: 'clients', supabase: 'clients' },
  { firebase: 'employees', supabase: 'employees' },
  { firebase: 'items', supabase: 'items' },
  { firebase: 'vendors', supabase: 'vendors' },
  { firebase: 'invoices', supabase: 'invoices' },
  { firebase: 'tasks', supabase: 'tasks' }
];

// Authenticate with Firebase
async function authenticateWithFirebase() {
  console.log('Authentication required to access Firebase data');
  
  const email = await prompt('Enter your Firebase email: ');
  // Using readline-sync for hiding password input
  const password = await prompt('Enter your Firebase password: ');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(`Successfully authenticated as ${userCredential.user.email}`);
    return true;
  } catch (error) {
    console.error('Authentication failed:', error.message);
    return false;
  }
}

// Process the migration
async function migrateData() {
  console.log('Starting migration from Firebase to Supabase...');
  
  // Authenticate first
  const authenticated = await authenticateWithFirebase();
  if (!authenticated) {
    console.error('Migration aborted: Authentication required to access Firebase data');
    rl.close();
    return;
  }
  
  const results = {};

  // Migrate each collection
  for (const { firebase, supabase: supabaseTable } of collections) {
    try {
      console.log(`Migrating collection: ${firebase} to ${supabaseTable}...`);
      
      // Fetch all documents from Firebase
      const querySnapshot = await getDocs(collection(db, firebase));
      
      if (querySnapshot.empty) {
        console.log(`No documents found in ${firebase}`);
        results[firebase] = {
          success: true,
          message: `No documents found in ${firebase}`,
          count: 0
        };
        continue;
      }
      
      console.log(`Found ${querySnapshot.size} documents in ${firebase}`);
      
      // Prepare data for Supabase
      const documents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Preserve the Firestore document ID
        data.id = doc.id;
        return data;
      });
      
      // Save data to a JSON backup file
      const backupDir = path.resolve(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const backupPath = path.join(backupDir, `${firebase}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(documents, null, 2));
      console.log(`Backup saved to ${backupPath}`);
      
      // Insert data into Supabase
      const { error } = await supabase
        .from(supabaseTable)
        .insert(documents);
      
      if (error) {
        console.error(`Error migrating ${firebase}:`, error);
        results[firebase] = {
          success: false,
          message: `Error migrating ${firebase}: ${error.message}`,
          error,
          count: 0
        };
      } else {
        console.log(`Successfully migrated ${documents.length} documents from ${firebase} to ${supabaseTable}`);
        results[firebase] = {
          success: true,
          message: `Successfully migrated ${documents.length} documents from ${firebase} to ${supabaseTable}`,
          count: documents.length
        };
      }
    } catch (error) {
      console.error(`Error processing ${firebase}:`, error);
      results[firebase] = {
        success: false,
        message: `Error processing ${firebase}: ${error.message}`,
        error,
        count: 0
      };
    }
  }

  // Migrate counters collection
  try {
    console.log('Migrating counters...');
    const querySnapshot = await getDocs(collection(db, 'counters'));
    const counters = {};
    
    querySnapshot.forEach(doc => {
      counters[doc.id] = doc.data();
    });
    
    // Backup counters
    const backupDir = path.resolve(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, 'counters.json');
    fs.writeFileSync(backupPath, JSON.stringify(counters, null, 2));
    
    // Insert counters into Supabase
    const counterEntries = Object.entries(counters).map(([key, value]) => ({
      name: key,
      value: value.currentNumber || 0
    }));
    
    const { error } = await supabase
      .from('counters')
      .insert(counterEntries);
    
    if (error) {
      console.error('Error migrating counters:', error);
      results['counters'] = {
        success: false,
        message: `Error migrating counters: ${error.message}`,
        error,
        count: 0
      };
    } else {
      console.log(`Successfully migrated ${counterEntries.length} counters`);
      results['counters'] = {
        success: true,
        message: `Successfully migrated ${counterEntries.length} counters`,
        count: counterEntries.length
      };
    }
  } catch (error) {
    console.error('Error migrating counters:', error);
    results['counters'] = {
      success: false,
      message: `Error migrating counters: ${error.message}`,
      error,
      count: 0
    };
  }

  // Print summary
  console.log('\nMigration Summary:');
  for (const [collection, result] of Object.entries(results)) {
    console.log(`${collection}: ${result.success ? '✅' : '❌'} ${result.message}`);
  }

  // Save results to a file
  const resultsPath = path.join(process.cwd(), 'migration-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed results saved to ${resultsPath}`);
  
  // Close readline interface
  rl.close();
}

// Run the migration
migrateData().catch(error => {
  console.error('Migration failed:', error);
  rl.close();
  process.exit(1);
}); 