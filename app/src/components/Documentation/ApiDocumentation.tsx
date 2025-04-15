import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';

interface ApiDocumentationProps {
  workspaceId: string;
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
      <pre className="!bg-[#272822] !m-0 rounded-md !text-[13px] leading-normal p-4">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

const EXAMPLE_SCHEMAS = {
  blog: {
    name: "Blog",
    table: "blog_posts",
    fields: ["id", "title", "content", "author_id", "category_id", "status", "published_at", "created_at"],
    relations: ["authors", "categories", "comments"],
  },
  product: {
    name: "Product Catalog",
    table: "products",
    fields: ["id", "name", "description", "price", "stock", "category_id", "metadata", "created_at"],
    relations: ["categories", "variants", "reviews"],
  },
  event: {
    name: "Event",
    table: "events",
    fields: ["id", "title", "description", "start_date", "end_date", "location", "organizer_id", "status"],
    relations: ["organizers", "attendees", "tickets"],
  }
};

export const ApiDocumentation: React.FC<ApiDocumentationProps> = ({ workspaceId }) => {
  const [selectedSchema, setSelectedSchema] = React.useState<keyof typeof EXAMPLE_SCHEMAS>("blog");
  const schema = EXAMPLE_SCHEMAS[selectedSchema];

  React.useEffect(() => {
    Prism.highlightAll();
  }, [selectedSchema]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Access your content using the Supabase JavaScript client
            </CardDescription>
          </div>
          <Select value={selectedSchema} onValueChange={(value: keyof typeof EXAMPLE_SCHEMAS) => setSelectedSchema(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EXAMPLE_SCHEMAS).map(([key, { name }]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Card className="bg-muted p-4">
            <h4 className="font-medium mb-2">Setup Supabase Client</h4>
            <CodeBlock
              language="typescript"
              code={`import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)`}
            />
          </Card>

          <Card className="bg-muted p-4">
            <h4 className="font-medium mb-2">Basic CRUD Operations</h4>
            <CodeBlock
              language="typescript"
              code={`// Create a new ${schema.name.toLowerCase()}
const create = async (data) => {
  const { data: result, error } = await supabase
    .from('${schema.table}')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return result
}

// Read a single ${schema.name.toLowerCase()} by ID
const getById = async (id) => {
  const { data, error } = await supabase
    .from('${schema.table}')
    .select(\`
      ${schema.fields.join(',\n      ')}
    \`)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Update a ${schema.name.toLowerCase()}
const update = async (id, data) => {
  const { data: result, error } = await supabase
    .from('${schema.table}')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return result
}

// Delete a ${schema.name.toLowerCase()}
const delete${schema.name} = async (id) => {
  const { error } = await supabase
    .from('${schema.table}')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}`}
            />
          </Card>

          <Card className="bg-muted p-4">
            <h4 className="font-medium mb-2">Advanced Queries</h4>
            <CodeBlock
              language="typescript"
              code={`// Fetch ${schema.name.toLowerCase()} with relations
const getWithRelations = async (id) => {
  const { data, error } = await supabase
    .from('${schema.table}')
    .select(\`
      *,
      ${schema.relations.map(r => `${r} (*)`).join(',\n      ')}
    \`)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Query with filters and pagination
const queryWithFilters = async ({ 
  page = 1, 
  perPage = 10,
  filters = {},
  orderBy = { column: 'created_at', ascending: false }
}) => {
  let query = supabase
    .from('${schema.table}')
    .select('*', { count: 'exact' })
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query = query.eq(key, value)
  })
  
  // Apply pagination
  const start = (page - 1) * perPage
  query = query
    .order(orderBy.column, { ascending: orderBy.ascending })
    .range(start, start + perPage - 1)
  
  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

// Upsert (insert or update) ${schema.name.toLowerCase()}
const upsert = async (data) => {
  const { data: result, error } = await supabase
    .from('${schema.table}')
    .upsert(data, {
      onConflict: 'id',
      ignoreDuplicates: false
    })
    .select()
  
  if (error) throw error
  return result
}

// Complex nested query with specific fields
const getDetailedView = async (id) => {
  const { data, error } = await supabase
    .from('${schema.table}')
    .select(\`
      id,
      ${schema.fields.slice(1, 4).join(',\n      ')},
      ${schema.relations[0]!} (
        id,
        name,
        email
      ),
      ${schema.relations[1]!} (
        id,
        name,
        ${schema.relations[1] === 'categories' ? 'parent_id' : 'type'}
      )
    \`)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Full-text search with ordering
const search = async (query, { limit = 10, offset = 0 }) => {
  const { data, error } = await supabase
    .from('${schema.table}')
    .select('*')
    .textSearch('${schema.fields[1]}', query)
    .order('${schema.fields[schema.fields.length - 1]}', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data
}`}
            />
          </Card>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Note:</strong> For more examples and advanced usage, refer to the <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="underline">official Supabase documentation</a>.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
