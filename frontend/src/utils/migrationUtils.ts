import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';
import { supabase } from '../config/supabase';

/**
 * Migrates data from Firebase to Supabase
 * 
 * @param collectionName The name of the Firebase collection to migrate
 * @param tableName The name of the Supabase table to migrate to
 * @param transform Optional function to transform the data before insertion
 * @returns A report on the migration results
 */
export async function migrateCollection(
  collectionName: string, 
  tableName: string,
  transform?: (data: any) => any
) {
  console.log(`Starting migration of ${collectionName} to ${tableName}...`);
  
  try {
    // Check if user is authenticated
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'Authentication required to access Firebase data',
        totalDocuments: 0,
        migratedDocuments: 0
      };
    }
    
    // Fetch all documents from Firebase
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`No documents found in ${collectionName}`);
      return {
        success: true,
        message: `No documents found in ${collectionName}`,
        totalDocuments: 0,
        migratedDocuments: 0
      };
    }
    
    console.log(`Found ${querySnapshot.size} documents in ${collectionName}`);
    
    // Prepare data for Supabase
    const documents = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Preserve the Firestore document ID
      data.id = doc.id;
      
      // Apply transformation if provided
      return transform ? transform(data) : data;
    });
    
    // Insert data into Supabase
    const { data, error } = await supabase
      .from(tableName)
      .insert(documents);
    
    if (error) {
      console.error(`Error migrating ${collectionName}:`, error);
      return {
        success: false,
        message: `Error migrating ${collectionName}: ${error.message}`,
        error,
        totalDocuments: querySnapshot.size,
        migratedDocuments: 0
      };
    }
    
    console.log(`Successfully migrated ${documents.length} documents from ${collectionName} to ${tableName}`);
    
    return {
      success: true,
      message: `Successfully migrated ${documents.length} documents from ${collectionName} to ${tableName}`,
      totalDocuments: querySnapshot.size,
      migratedDocuments: documents.length
    };
  } catch (error) {
    console.error(`Error in migration process:`, error);
    return {
      success: false,
      message: `Error in migration process: ${(error as Error).message}`,
      error,
      totalDocuments: 0,
      migratedDocuments: 0
    };
  }
}

/**
 * Migrates the counters collection from Firebase to Supabase
 */
export async function migrateCounters() {
  try {
    // Check if user is authenticated
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'Authentication required to access Firebase data',
        migratedCounters: 0
      };
    }
    
    // Get the quotation counter from Firebase
    const querySnapshot = await getDocs(collection(db, 'counters'));
    const counters: Record<string, any> = {};
    
    querySnapshot.forEach(doc => {
      counters[doc.id] = doc.data();
    });
    
    // Create a table in Supabase for counters if it doesn't exist
    const { error: tableError } = await supabase.rpc('create_counters_table_if_not_exists');
    
    if (tableError) {
      console.error('Error creating counters table:', tableError);
      return {
        success: false,
        message: `Error creating counters table: ${tableError.message}`,
        error: tableError
      };
    }
    
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
      return {
        success: false,
        message: `Error migrating counters: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      message: `Successfully migrated ${counterEntries.length} counters`,
      migratedCounters: counterEntries.length
    };
  } catch (error) {
    console.error('Error migrating counters:', error);
    return {
      success: false,
      message: `Error migrating counters: ${(error as Error).message}`,
      error
    };
  }
}

/**
 * Migrates all collections from Firebase to Supabase
 */
export async function migrateAllCollections() {
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
  
  // Check if user is authenticated
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return {
      auth_error: {
        success: false,
        message: 'Authentication required to access Firebase data'
      }
    };
  }
  
  const results: Record<string, any> = {};
  
  for (const { firebase, supabase: supabaseTable } of collections) {
    results[firebase] = await migrateCollection(firebase, supabaseTable);
  }
  
  // Migrate counters separately
  results['counters'] = await migrateCounters();
  
  return results;
} 