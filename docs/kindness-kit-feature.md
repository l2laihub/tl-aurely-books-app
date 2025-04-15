# Kindness Kit Feature

This document provides information about the Kindness Kit feature, which allows users to sign up to receive a free "Ripple Kindness Kit" download in exchange for their email.

## Overview

The Kindness Kit feature allows:
- Users to sign up with their email to receive downloadable content
- Admins to create and manage different kits for different books
- Integration with MailerLite for email marketing

## Database Tables

The feature uses the following tables in Supabase:

1. `kindness_kits` - Stores information about each kit
2. `kit_files` - Stores files associated with each kit
3. `kit_subscribers` - Stores subscriber information

## Setup Instructions

### 1. Environment Variables

Make sure the following environment variables are set in your `.env` file and in your Netlify environment:

```
# For frontend
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# For Netlify functions
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
MAILERLITE_API_KEY=your-mailerlite-api-key
```

### 2. Database Migrations

Run the database migrations to create the necessary tables and set up RLS policies:

```bash
npx supabase migration up
```

### 3. Environment Variables

For local development, create a `.env.development` file with the following variables:

```
# Supabase credentials
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# MailerLite API key
MAILERLITE_API_KEY=your-mailerlite-api-key

# Resend API key
RESEND_API_KEY=your-resend-api-key
```

For production, set these environment variables in your Netlify dashboard.

### 4. Local Development with Netlify Functions

To test the Netlify functions locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Netlify dev server using one of these methods:
   
   a. Using npm script (recommended):
   ```bash
   npm run netlify-dev
   ```
   
   b. Using the provided scripts:
   - On Windows: `start-netlify-dev.bat`
   - On macOS/Linux: `./start-netlify-dev.sh` (make it executable first with `chmod +x start-netlify-dev.sh`)

3. The Netlify dev server will start and serve your application with the functions available at `http://localhost:8888/.netlify/functions/`

**Important**: The Netlify dev server will load environment variables from the `.env.development` file. Make sure this file exists and contains the correct values.

### 5. MailerLite Integration

1. Create a group in MailerLite for each kindness kit
2. Get the group ID from MailerLite
3. Add the group ID to the kindness kit in the admin panel

## Admin Usage

### Creating a Kindness Kit

1. Go to the Admin Panel
2. Navigate to "Kindness Kits"
3. Click "Create New Kit"
4. Fill in the details:
   - Title
   - Headline
   - Subheadline
   - Select a book
   - Upload a hero image
   - Add MailerLite group ID (optional)
   - Set active status
5. Click "Save"

### Adding Files to a Kit

1. Go to the Admin Panel
2. Navigate to "Kindness Kits"
3. Click "Manage Files" for the kit you want to edit
4. Click "Add File"
5. Fill in the details:
   - File name
   - File type (PDF, Audio, Image)
   - Upload the file
6. Click "Save"

### Viewing Subscribers

1. Go to the Admin Panel
2. Navigate to "Kindness Kits"
3. Click "View Subscribers" for the kit you want to view
4. You'll see a list of all subscribers with their email and name

## User Experience

When a user visits a book page with an associated kindness kit:

1. They'll see a signup form with:
   - Name field (optional)
   - Email field (required)
   - Terms checkbox
   - Submit button
2. After submitting, they'll see:
   - Thank you message
   - Download links for all files in the kit

## Troubleshooting

### RLS Policy Issues

If you encounter RLS policy errors when users try to sign up, you can:

1. Run the specific RLS fix migration:
   ```
   npx supabase migration up 20250414191300_fix_kit_subscribers_rls.sql
   ```

2. Or run the direct SQL script in the Supabase SQL editor:
   ```sql
   -- See fix_kit_subscribers_rls.sql for the full script
   ```

3. Make sure you're using the Netlify dev server for local testing:
   ```
   npm run netlify-dev
   ```
   This ensures the Netlify functions are available at the correct URL and environment variables are loaded properly.

4. Check that your `.env.development` file contains the correct Supabase service role key.
5. If you're still having issues, check the Netlify function logs for more detailed error messages. The function has been updated to provide more debugging information.
6. The application now uses a Netlify function to bypass RLS for subscriber creation, which should resolve most issues.
3. The application now uses a Netlify function to bypass RLS for subscriber creation, which should resolve most issues.

### MailerLite Integration Issues

If subscribers aren't being added to MailerLite:

1. Check that your MAILERLITE_API_KEY is correct
2. Verify the group ID is correct in the kindness kit settings
3. Check the Netlify function logs for any errors

## Implementation Details

The feature consists of:

1. Frontend components:
   - KindnessKitSignup.tsx - The signup form component
   - Admin components for managing kits and files

2. Backend services:
   - kindnessKitService.ts - Service for CRUD operations
   - Netlify functions:
     - add-kit-subscriber.js - Adds subscribers to the database
     - add-mailerlite-subscriber.js - Adds subscribers to MailerLite

3. Database:
   - Tables and RLS policies defined in migration files