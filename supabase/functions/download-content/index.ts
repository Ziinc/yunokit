import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Buffer } from 'jsr:node:buffer';
// For Deno we'll use a different CSV and ZIP library
import { stringify } from 'https://deno.land/std@0.177.0/csv/stringify.ts';
import { 
  BlobWriter,
  TextReader,
  ZipWriter
} from "https://deno.land/x/zipjs@v2.7.17/index.js";

// Define the type for content items
interface ContentItem {
  id: string;
  schemaId: string;
  title: string;
  content?: Record<string, any>;
  data?: Record<string, any>;
  status: 'draft' | 'pending_review' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  publishedBy?: string;
  comments?: any[];
  reviewStatus?: string;
  reviewRequestedAt?: string;
  reviewRequestedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
  type?: string;
  lastUpdated?: string;
  tags?: string[];
  author?: {
    name: string;
    avatar: string;
  };
}

// Helper for CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    
    // Verify the user's session
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse URL to get query parameters
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';
    const ids = url.searchParams.get('ids')?.split(',') || [];
    
    if (ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No content IDs provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch content items from the database
    const { data: contentItems, error: contentError } = await supabaseClient
      .from('content_items')
      .select('*')
      .in('id', ids);
    
    if (contentError) {
      return new Response(
        JSON.stringify({ error: 'Error fetching content items', details: contentError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!contentItems || contentItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No content items found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the content based on the requested format
    let responseData: Uint8Array | string;
    let contentType: string;
    let filename: string;
    
    switch (format) {
      case 'csv':
        // Convert to CSV using Deno's CSV library
        const flattenedItems = contentItems.map(item => ({
          id: item.id,
          title: item.title,
          schemaId: item.schemaId,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy
        }));
        
        // Generate CSV
        responseData = stringify(flattenedItems, {
          header: true
        });
        
        contentType = 'text/csv';
        filename = `content-export-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
        
      case 'jsonl':
        // Convert to JSONL (one JSON object per line)
        responseData = contentItems.map(item => JSON.stringify(item)).join('\n');
        contentType = 'application/x-jsonlines';
        filename = `content-export-${new Date().toISOString().slice(0, 10)}.jsonl`;
        break;
        
      case 'zip':
        // Create a ZIP file using zip.js
        const zipWriter = new ZipWriter(new BlobWriter());
        
        // Add individual JSON files
        for (const item of contentItems) {
          const itemJson = JSON.stringify(item, null, 2);
          await zipWriter.add(`${item.id}.json`, new TextReader(itemJson));
        }
        
        // Add combined JSON file with all items
        const allItemsJson = JSON.stringify(contentItems, null, 2);
        await zipWriter.add('all-items.json', new TextReader(allItemsJson));
        
        // Generate the ZIP file
        responseData = await zipWriter.close();
        contentType = 'application/zip';
        filename = `content-export-${new Date().toISOString().slice(0, 10)}.zip`;
        break;
        
      case 'json':
      default:
        // Default to JSON
        responseData = JSON.stringify(contentItems, null, 2);
        contentType = 'application/json';
        filename = `content-export-${new Date().toISOString().slice(0, 10)}.json`;
        break;
    }
    
    // Return the appropriate response
    const headers = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    };
    
    return new Response(
      responseData instanceof Uint8Array ? responseData : responseData,
      { headers }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 