import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface TableStatus {
  table: string;
  exists: boolean;
  count: number;
  error?: string;
}

interface MigrationStatus {
  success: boolean;
  tablesFound?: number;
  totalTables?: number;
  tableStatus?: TableStatus[];
  error?: string;
}

// API endpoint
const API_URL = 'http://localhost:3001';

export default function PostgresMigrationStatus() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/api/test-connection`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionError('Could not connect to the API server. Make sure the server is running.');
      return false;
    }
  };

  const checkMigrationStatus = async () => {
    setLoading(true);
    setConnectionError(null);
    
    try {
      // First check if the API is accessible
      const isConnected = await checkDatabaseConnection();
      
      if (!isConnected) {
        setLoading(false);
        return;
      }
      
      // Get tables status
      const response = await fetch(`${API_URL}/api/check-tables`);
      const result = await response.json();
      
      setStatus(result);
    } catch (error) {
      console.error('Error checking migration status:', error);
      setStatus({
        success: false,
        error: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>PostgreSQL Migration Status</CardTitle>
          <CardDescription>
            Check the status of your database migration using PostgreSQL API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionError && (
            <div className="p-4 mb-4 border border-red-300 bg-red-50 rounded-md">
              <h3 className="font-medium text-red-800 mb-2">Connection Error</h3>
              <p className="text-red-700">{connectionError}</p>
              <p className="text-red-700 mt-2">
                Please make sure the server is running with:
                <pre className="bg-gray-100 p-2 mt-1 rounded text-sm">
                  cd server && node index.js
                </pre>
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Checking database status...</p>
            </div>
          ) : status ? (
            <>
              {status.error ? (
                <div className="p-4 border border-red-300 bg-red-50 rounded-md">
                  <h3 className="font-medium text-red-800 mb-2">Error checking migration status</h3>
                  <p className="text-red-700">{status.error}</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 border bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Tables Found:</span> 
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                        {status.tablesFound} of {status.totalTables}
                      </span>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: `${status.tablesFound && status.totalTables 
                            ? (status.tablesFound / status.totalTables) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-2 border">Table</th>
                          <th className="text-left p-2 border">Status</th>
                          <th className="text-left p-2 border">Records</th>
                        </tr>
                      </thead>
                      <tbody>
                        {status.tableStatus?.map((table) => (
                          <tr key={table.table} className="border-b">
                            <td className="p-2 border">{table.table}</td>
                            <td className="p-2 border">
                              <div className="flex items-center">
                                {table.exists ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                    <span>Exists</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                    <span>Missing</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-2 border">
                              {table.exists ? table.count : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={checkMigrationStatus} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : 'Refresh Status'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 