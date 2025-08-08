import React, { useState } from 'react';
import { migrateCollection, migrateAllCollections, migrateCounters } from '../utils/migrationUtils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';

interface MigrationResultItem {
  success: boolean;
  message: string;
  totalDocuments?: number;
  migratedDocuments?: number;
  error?: any;
}

type MigrationResults = Record<string, MigrationResultItem>;

export default function MigrationTool() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MigrationResults | null>(null);
  const [migrateAll, setMigrateAll] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([
    'quotations', 
    'companies', 
    'clients', 
    'employees', 
    'items',
    'vendors',
    'invoices',
    'tasks',
    'counters'
  ]);

  const collections = [
    { value: 'quotations', label: 'Quotations' },
    { value: 'companies', label: 'Companies' },
    { value: 'clients', label: 'Clients' },
    { value: 'employees', label: 'Employees' },
    { value: 'items', label: 'Items' },
    { value: 'vendors', label: 'Vendors' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'tasks', label: 'Tasks' },
    { value: 'counters', label: 'Counters' }
  ];

  const handleMigrateClick = async () => {
    if (!user) {
      setResults({
        error: {
          success: false,
          message: "Authentication required. Please login first.",
          error: new Error("Not authenticated")
        }
      });
      return;
    }

    setLoading(true);
    setResults(null);
    
    try {
      if (migrateAll) {
        const results = await migrateAllCollections();
        setResults(results);
      } else {
        const results: MigrationResults = {};
        
        // Migrate selected collections
        for (const collection of selectedCollections) {
          if (collection === 'counters') {
            results[collection] = await migrateCounters();
          } else {
            results[collection] = await migrateCollection(collection, collection);
          }
        }
        
        setResults(results);
      }
    } catch (error) {
      console.error('Migration error:', error);
      setResults({
        error: {
          success: false,
          message: `Unexpected error: ${(error as Error).message}`,
          error
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionToggle = (collection: string, checked: boolean) => {
    if (checked) {
      setSelectedCollections(prev => [...prev, collection]);
    } else {
      setSelectedCollections(prev => prev.filter(c => c !== collection));
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Firebase to Supabase Migration Tool</CardTitle>
        <CardDescription>
          This tool will migrate your Firebase data to Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!user && (
            <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md flex gap-3 items-start">
              <Info className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Authentication Required</h4>
                <p className="text-sm text-yellow-700">
                  You need to be logged in to perform the migration. Please log in first.
                </p>
              </div>
            </div>
          )}
        
          <div className="flex items-center space-x-2">
            <Checkbox
              id="migrateAll"
              checked={migrateAll}
              onCheckedChange={(checked) => setMigrateAll(checked as boolean)}
              disabled={!user || loading}
            />
            <Label htmlFor="migrateAll" className="font-medium">
              Migrate all collections
            </Label>
          </div>

          {!migrateAll && (
            <div className="border rounded-md p-3">
              <Label className="block mb-2 font-medium">Select collections to migrate:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {collections.map((collection) => (
                  <div key={collection.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`collection-${collection.value}`}
                      checked={selectedCollections.includes(collection.value)}
                      onCheckedChange={(checked) => 
                        handleCollectionToggle(collection.value, checked as boolean)
                      }
                      disabled={!user || loading}
                    />
                    <Label htmlFor={`collection-${collection.value}`}>
                      {collection.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && (
            <div className="border rounded-md p-3 mt-4 max-h-[300px] overflow-y-auto">
              <h3 className="font-medium mb-2">Migration Results:</h3>
              <ul className="space-y-2">
                {Object.entries(results).map(([collection, result]) => (
                  <li key={collection} className="flex items-start space-x-2 p-2 rounded-md bg-gray-50">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium">{collection}</h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                      {result.totalDocuments !== undefined && (
                        <p className="text-sm text-gray-600">
                          Migrated {result.migratedDocuments} of {result.totalDocuments} documents
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleMigrateClick} 
          disabled={loading || !user || (!migrateAll && selectedCollections.length === 0)}
          className="w-full"
        >
          {loading ? 'Migrating...' : 'Start Migration'}
        </Button>
      </CardFooter>
    </Card>
  );
} 