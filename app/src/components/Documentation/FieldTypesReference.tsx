
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Check, Code, FileText, List } from "lucide-react";
import { BookOpen as BookIcon } from "lucide-react";

export const FieldTypesReference: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Types Reference</CardTitle>
        <CardDescription>
          Comprehensive guide to all available field types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p>
          FunCMS offers a wide range of field types to suit different content needs. Each field type has specific 
          capabilities and use cases to help structure your content effectively.
        </p>
        
        <div className="space-y-6">
          {/* Text & Content Fields */}
          <div>
            <h3 className="text-lg font-medium mb-4">Text & Content Fields</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Markdown</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Formatted text content with markdown support
                    </p>
                    <div className="text-xs p-2 rounded bg-muted font-mono">
                      # Heading<br />
                      This is a **markdown** example with *formatting*.<br />
                      - List item 1<br />
                      - List item 2
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Blog posts, article content, product descriptions
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <h4 className="font-medium">JSON</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Structured data in JSON format
                    </p>
                    <div className="text-xs p-2 rounded bg-muted font-mono overflow-x-auto">
                      {`{
  "name": "Product Name",
  "price": 29.99,
  "variants": ["small", "medium", "large"],
  "metadata": {
    "weight": "1.5kg",
    "dimensions": "10x5x2"
  }
}`}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Complex structured data, API configurations, product details
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <BookIcon className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Block</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Visual block-based content editor
                    </p>
                    <div className="text-xs p-2 rounded bg-muted font-mono">
                      {`[
  { "type": "heading", "content": "Welcome" },
  { "type": "paragraph", "content": "This is block content..." },
  { "type": "image", "url": "/image.jpg", "alt": "Example" }
]`}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Page builders, flexible layouts, visual content
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Selection Fields */}
          <div>
            <h3 className="text-lg font-medium mb-4">Selection Fields</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Boolean</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      True/false toggle switch
                    </p>
                    <div className="flex items-center gap-4 text-xs p-2 rounded bg-muted">
                      <span>True ✓</span>
                      <span>False ✗</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Feature flags, toggles, availability status
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <List className="h-5 w-5 text-amber-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Enum</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Single selection from predefined options
                    </p>
                    <div className="flex flex-col gap-1 text-xs p-2 rounded bg-muted">
                      <span>● Option One</span>
                      <span>○ Option Two</span>
                      <span>○ Option Three</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Categories, status selections, type definitions
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <List className="h-5 w-5 text-cyan-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Multiselect</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Multiple selections from predefined options
                    </p>
                    <div className="flex flex-col gap-1 text-xs p-2 rounded bg-muted">
                      <span>☑ Option One</span>
                      <span>☑ Option Two</span>
                      <span>☐ Option Three</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Tags, features, multiple categories
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-indigo-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Relation</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Reference to other content items
                    </p>
                    <div className="text-xs p-2 rounded bg-muted">
                      <span>Related to: "Getting Started with React" (Blog Post)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Related content, author references, product categories
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Special Fields */}
          <div>
            <h3 className="text-lg font-medium mb-4">Special Fields</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-slate-500 mt-1" />
                  <div>
                    <h4 className="font-medium">UUID</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Unique identifier field
                    </p>
                    <div className="text-xs p-2 rounded bg-muted font-mono overflow-x-auto">
                      a1b2c3d4-e5f6-7890-abcd-ef1234567890
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Generated IDs, unique references
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-violet-500 mt-1" />
                  <div>
                    <h4 className="font-medium">DateTime</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Date and time selection
                    </p>
                    <div className="text-xs p-2 rounded bg-muted">
                      2023-10-15T08:00:00Z
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Publishing dates, event times, scheduling
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-emerald-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Asset</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      File uploads and selections
                    </p>
                    <div className="text-xs p-2 rounded bg-muted">
                      <span>Image: product-image.jpg (250KB)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Use for:</strong> Images, documents, media files
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <Alert>
          <AlertDescription>
            <strong>Tip:</strong> When designing your schema, choose field types that provide the right balance of structure 
            and flexibility for your content editors.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
