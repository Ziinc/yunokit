# Content Download Supabase Edge Function

This Edge Function allows authenticated users to download content items in various formats.

## Features

- Authentication via Supabase Auth
- Download content in multiple formats:
  - JSON
  - CSV
  - JSONL (JSON Lines)
  - ZIP (contains individual JSON files for each item)
- Security checks to ensure only authenticated users can download content

## How It Works

1. The function receives a request with:
   - Authentication token in the Authorization header
   - Format parameter (json, csv, jsonl, or zip)
   - IDs of content items to download

2. It verifies the user's authentication using Supabase Auth

3. It fetches the requested content items from the database

4. It formats the data according to the requested format

5. It returns the formatted data with appropriate headers for download

## Development

To run locally:

```bash
cd supabase/functions/download-content
deno task dev
```

## Deployment

To deploy the function to your Supabase project:

```bash
cd supabase/functions/download-content
deno task deploy
```

Or from the project root:

```bash
supabase functions deploy download-content
```

## API Usage from Frontend

Example fetch code:

```typescript
const downloadContent = async (format, ids) => {
  const token = 'user-auth-token';
  const response = await fetch(
    `${SUPABASE_FUNCTIONS_URL}/download-content?format=${format}&ids=${ids.join(',')}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
  
  // Process the response for download
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = response.headers.get('Content-Disposition')?.split('filename=')[1].replace(/"/g, '') || 
               `content-export.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
``` 