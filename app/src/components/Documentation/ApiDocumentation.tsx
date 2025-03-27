
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ApiDocumentation: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Auto-Documentation</CardTitle>
        <CardDescription>
          Understanding how API examples are automatically generated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">How API Auto-Docs Work</h3>
          <p>
            SupaContent automatically generates API documentation based on your content schemas. This ensures that API examples always
            stay in sync with your content structure, providing ready-to-use code snippets for developers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Auto-Generation Process</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside ml-2">
                <li>
                  Schema definitions are analyzed
                </li>
                <li>
                  API endpoints are mapped to schema operations
                </li>
                <li>
                  Request and response examples are created
                </li>
                <li>
                  Code snippets are generated for multiple platforms
                </li>
                <li>
                  Documentation refreshes when schemas change
                </li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Available Code Examples</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>JavaScript/TypeScript:</strong> Fetch API, Axios
                </li>
                <li>
                  <strong>React:</strong> React Query, SWR
                </li>
                <li>
                  <strong>Vue:</strong> Vue composables
                </li>
                <li>
                  <strong>Mobile:</strong> React Native, Flutter
                </li>
                <li>
                  <strong>Server:</strong> Node.js, Python, PHP
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Example Auto-Generated API Code</h3>
          
          <Card className="bg-muted p-4">
            <h4 className="font-medium mb-2">Fetch Blog Posts (React with TanStack Query)</h4>
            <pre className="text-xs bg-black text-white p-3 rounded overflow-x-auto">
{`import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Fetch all blog posts
export const useBlogPosts = (filters = {}) => {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: async () => {
      let query = supabase
        .from('content_items')
        .select('*')
        .eq('schema_id', 'blog-post');
        
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.contains('content', { category: filters.category });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });
};

// Fetch a single blog post by ID
export const useBlogPost = (id) => {
  return useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .eq('schema_id', 'blog-post')
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};`}
            </pre>
          </Card>
          
          <div className="mt-4">
            <Link to="/api-examples">
              <Button className="gap-2">
                <Code className="h-4 w-4" />
                <span>Explore Complete API Examples</span>
              </Button>
            </Link>
          </div>
          
          <Alert>
            <AlertDescription>
              <strong>Pro Tip:</strong> Copy-paste code examples directly into your frontend applications for quick integration with your CMS content.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};
