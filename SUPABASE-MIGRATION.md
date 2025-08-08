# Firebase to Supabase Migration Guide

This guide documents the process of migrating the CRM system from Firebase to Supabase.

## Why Migrate?

- **Quota Limits**: Firebase free tier has restrictive quotas that we're hitting frequently
- **Cost Efficiency**: Supabase offers a more generous free tier and better pricing for small to medium businesses
- **SQL Support**: Supabase is PostgreSQL-based, providing full SQL capabilities
- **Simpler Auth**: Supabase Auth is built on top of PostgreSQL and offers similar features to Firebase Auth
- **Performance**: Supabase can provide better query performance for complex operations

## Prerequisites

1. Supabase account and project set up
2. Supabase URL and API keys (already configured in the codebase)
3. Node.js installed for running migration scripts
4. Firebase account with access to your project

## Migration Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install the required Supabase JavaScript client.

### 2. Set Up Supabase Database Schema

1. Log in to the Supabase dashboard: https://usydopzztlqyfaqrrcas.supabase.co
2. Go to the SQL Editor
3. Run the SQL commands from `supabase-schema.sql` to create the necessary tables and functions

### 3. Run Migration Script

To migrate your data from Firebase to Supabase, you can use either the UI tool or the command-line script.

#### Option A: Using the Web UI

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to `/migration` in your browser
3. Log in with your Firebase credentials (required to access the data)
4. Select the collections you want to migrate
5. Click "Start Migration"

#### Option B: Using the CLI Script

```bash
cd frontend
npm run migrate
```

You will be prompted to enter your Firebase credentials (email and password) to authenticate before migration.

The script will:
- Authenticate with Firebase using your credentials
- Extract all data from Firebase
- Create a backup of all data in JSON format in the `backups` folder
- Insert the data into Supabase
- Provide a detailed migration report

### 4. Testing the Migration

After migration, you should test the application to ensure everything is working correctly:

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Test key functionality:
   - Authentication
   - Creating quotations
   - Viewing and editing companies
   - Any other critical business processes

## File Structure Changes

The migration involves these new files:

- `frontend/src/config/supabase.ts`: Supabase client configuration
- `frontend/src/contexts/SupabaseAuthContext.tsx`: Authentication context using Supabase
- `frontend/src/services/supabaseQuotationService.ts`: Quotation service using Supabase
- `frontend/src/services/supabaseCompanyService.ts`: Company service using Supabase
- `frontend/src/utils/supabaseGenerateId.ts`: ID generation utilities for Supabase
- `frontend/src/utils/migrationUtils.ts`: Utilities for migrating data
- `frontend/src/components/MigrationTool.tsx`: UI tool for data migration
- `frontend/scripts/migrate-to-supabase.js`: Server-side migration script
- `supabase-schema.sql`: SQL script for setting up the database schema

## Migration Strategy

The migration follows these steps:

1. **Dual Support Phase**: Initially supporting both Firebase and Supabase
2. **Data Migration**: Moving all data from Firebase to Supabase
3. **Switch Service Implementations**: Switching service implementations to use Supabase
4. **Remove Firebase**: After confirming everything works, remove Firebase dependencies

## Authentication Requirements

Both the UI tool and command-line script require Firebase authentication to access your data. This is because:

1. Firebase security rules restrict access to authenticated users
2. The migration tools need permission to read all your collections

Make sure you have a valid Firebase user account with permissions to access all the required collections.

## Rollback Plan

If issues arise during migration:

1. Revert code changes to use Firebase services
2. Restore any data from backups if needed

Backups are automatically created in the `frontend/backups` folder during migration.

## Known Issues and Limitations

- Supabase RLS (Row Level Security) is configured differently from Firebase security rules
- UUID format in Supabase differs from Firebase document IDs
- Date handling might differ between platforms
- Firebase permissions may prevent accessing some collections

## Troubleshooting

### "Missing or insufficient permissions" Error

If you see this error:
1. Make sure you're logged in with a user that has admin privileges
2. Check your Firebase security rules to ensure they allow admin reads
3. Try the UI migration tool which uses the currently logged-in user's credentials

### "Function not found" in Supabase

If Supabase functions like `create_counters_table_if_not_exists` aren't found:
1. Make sure you've run the SQL script from `supabase-schema.sql`
2. Check for any SQL errors in the Supabase dashboard

## Support

If you encounter any issues during migration, please check:

1. Migration logs in `migration-results.json`
2. Supabase dashboard for errors
3. Application logs for runtime errors