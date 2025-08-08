import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkMigrationStatus, checkTablesExist } from '../utils/checkMigrationStatus';
import { AlertCircle, CheckCircle2, Database, ExternalLink } from 'lucide-react';

interface TableStatus {
  table: string;
  exists: boolean;
  count?: number;
  error?: string;
}

export default function MigrationStatus() {
  const [loading, setLoading] = useState(true);
  const [tablesStatus, setTablesStatus] = useState<TableStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        setLoading(true);
        
        // First check if tables exist
        const tablesExist = await checkTablesExist();
        
        if (!tablesExist.success || !tablesExist.tableStatus) {
          setError(`Error checking tables: ${tablesExist.error || 'Unknown error'}`);
          return;
        }
        
        // Then check if there's data in each table
        const migrationStatus = await checkMigrationStatus();
        
        // Combine results
        const tableResults = tablesExist.tableStatus.map(table => {
          const status = migrationStatus[table.table];
          return {
            table: table.table,
            exists: table.exists,
            count: status?.count || 0,
            error: status?.error
          };
        });
        
        setTablesStatus(tableResults);
      } catch (err) {
        setError(`Failed to check migration status: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    }
    
    checkStatus();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Database className="mr-2 h-6 w-6" />
          Supabase Migration Status
        </h1>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            This page shows the current status of tables in Supabase and whether data has been successfully migrated.
          </p>
          <Link 
            to="/postgres-migration-status" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <span>PostgreSQL Direct Check</span>
            <ExternalLink className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error checking migration status</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tablesStatus.map((table) => (
                <li key={table.table}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {table.exists ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <p className="font-medium text-indigo-600 truncate">{table.table}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${table.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {table.exists ? 'Exists' : 'Missing'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Records: {table.count || 0}
                        </p>
                      </div>
                      {table.error && (
                        <div className="mt-2 flex items-center text-sm text-red-500 sm:mt-0">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {table.error}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium mb-2">Summary</h2>
            <p className="mb-1">Tables Found: {tablesStatus.filter(t => t.exists).length}/{tablesStatus.length}</p>
            <p>Tables With Data: {tablesStatus.filter(t => t.count && t.count > 0).length}/{tablesStatus.length}</p>

            {tablesStatus.filter(t => t.exists).length === 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-700">
                  <strong>No tables found in Supabase.</strong> You need to run the SQL script from <code>supabase-schema.sql</code> in the Supabase dashboard before migrating data.
                </p>
              </div>
            )}

            {tablesStatus.filter(t => t.exists).length > 0 && tablesStatus.filter(t => t.count && t.count > 0).length === 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Tables exist but no data found.</strong> You need to run the migration script to transfer data from Firebase to Supabase.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 