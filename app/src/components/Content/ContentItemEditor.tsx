
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSchemaRow } from "@/lib/api/SchemaApi";
import { TiptapEditor } from "./TiptapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

// Simple JSON syntax highlighter
const highlightJSON = (jsonString: string): string => {
  return jsonString
    .replace(/("([^"\\]|\\.)*")\s*:/g, '<span style="color: #7dd3fc;">$1</span>:') // Keys (cyan)
    .replace(/:\s*("([^"\\]|\\.)*")/g, ': <span style="color: #86efac;">$1</span>') // String values (green)
    .replace(/:\s*(true|false)/g, ': <span style="color: #fbbf24;">$1</span>') // Booleans (yellow)
    .replace(/:\s*(null)/g, ': <span style="color: #f87171;">$1</span>') // Null (red)
    .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color: #c084fc;">$1</span>') // Numbers (purple)
    .replace(/([{}[\]])/g, '<span style="color: #e2e8f0;">$1</span>') // Brackets (light gray)
    .replace(/(,)/g, '<span style="color: #64748b;">$1</span>'); // Commas (gray)
};

interface ContentItemEditorProps {
  schema: ContentSchemaRow;
  initialData?: Record<string, unknown>;
  initialTitle?: string;
  onSave: (contentItem: {
    title: string;
    data: Record<string, unknown>;
  }) => void;
}

export const ContentItemEditor: React.FC<ContentItemEditorProps> = ({
  schema,
  initialData = {},
  initialTitle = "",
  onSave,
}) => {
  const { toast } = useToast();
  const [content, setContent] = useState<Record<string, unknown>>(initialData);
  const [title, setTitle] = useState<string>(initialTitle);
  const [activeTab, setActiveTab] = useState<string>("fields");


  const handleSave = () => {
    // Validate title
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for this content",
        variant: "destructive",
      });
      return;
    }

    // Validate based on content format - check if we have fields
    if (content.fields && Array.isArray(content.fields)) {
      // For the new fields format, validate required fields
      const missingFields = content.fields
        .filter((field: { required: boolean; value: unknown; name: string }) => field.required && (!field.value || field.value === ''))
        .map((field: { name: string }) => field.name);

      if (missingFields.length > 0) {
        toast({
          title: "Required fields missing",
          description: `Please fill in the following fields: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    } else {
      // For legacy format, just check if we have some content
      if (Object.keys(content).length === 0) {
        toast({
          title: "No content to save",
          description: "Please add some content before saving",
          variant: "destructive",
        });
        return;
      }
    }

    console.log('content to save', content);
    onSave({
      title: title.trim(),
      data: content
    });
  };

  const handleTiptapChange = (newContent: Record<string, unknown>) => {
    console.log("newContent", newContent);
    setContent(newContent);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {schema.type === 'collection' ? "Edit Item" : `Edit ${schema.name}`}
          </h1>
          {!schema.strict && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">Flexible Schema</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This schema allows you to add custom fields. Use the "Add Field" button to create new content blocks as needed.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="fields">Content Fields</TabsTrigger>
          <TabsTrigger value="json">JSON Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fields" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="content-title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                id="content-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title..."
                className="text-lg font-semibold"
              />
            </div>
            <TiptapEditor
              schema={schema}
              content={content}
              onChange={handleTiptapChange}
              editable={true}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="json" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-md text-sm overflow-auto max-h-[600px] font-mono">
                <pre className="whitespace-pre-wrap">
                  <code dangerouslySetInnerHTML={{
                    __html: highlightJSON(JSON.stringify(
                      content,
                      null,
                      2
                    ))
                  }} />
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
