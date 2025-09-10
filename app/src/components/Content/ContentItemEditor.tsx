
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentSchema } from "@/lib/contentSchema";
import { TiptapEditor } from "./TiptapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ContentItemEditorProps {
  schema: ContentSchema;
  initialContent?: Record<string, unknown>;
  onSave: (content: Record<string, unknown>) => void;
}

export const ContentItemEditor: React.FC<ContentItemEditorProps> = ({
  schema,
  initialContent = {},
  onSave,
}) => {
  const { toast } = useToast();
  const [content, setContent] = useState<Record<string, unknown>>(initialContent);
  const [activeTab, setActiveTab] = useState<string>("fields");

  // Initialize content with default values from schema
  useEffect(() => {
    const defaults: Record<string, unknown> = {};
    
    schema.fields.forEach(field => {
      if (content[field.id] === undefined) {
        if (field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        } else {
          // Set default empty values based on type
          switch (field.type) {
            case "markdown":
              defaults[field.id] = "";
              break;
            case "json":
              defaults[field.id] = {};
              break;
            case "boolean":
              defaults[field.id] = false;
              break;
            case "enum":
              defaults[field.id] = field.options?.[0] || "";
              break;
            case "text":
              defaults[field.id] = "";
              break;
            case "number":
              defaults[field.id] = 0;
              break;
            case "date":
              defaults[field.id] = "";
              break;
            default:
              defaults[field.id] = "";
              break;
          }
        }
      }
    });
    
    setContent(prevContent => ({ ...defaults, ...prevContent }));
  }, [schema, initialContent]);


  const handleSave = () => {
    // For flexible schemas, validate by checking the editor content structure
    if (!schema.strict) {
      if (!content.__editorContent) {
        toast({
          title: "No content to save",
          description: "Please add some content before saving",
          variant: "destructive",
        });
        return;
      }
      onSave(content);
    } else {
      // For strict schemas, validate required fields as before
      const missingFields = schema.fields
        .filter(field => field.required && !content[field.id])
        .map(field => field.name);
      
      if (missingFields.length > 0) {
        toast({
          title: "Required fields missing",
          description: `Please fill in the following fields: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
      
      onSave(content);
    }

    toast({
      title: "Content saved",
      description: "Your content has been saved successfully",
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
            {schema.isCollection ? "Edit Item" : `Edit ${schema.name}`}
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
          <TiptapEditor
            schema={schema}
            content={content}
            onChange={handleTiptapChange}
            editable={true}
          />
        </TabsContent>
        
        <TabsContent value="json" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm overflow-auto max-h-[600px]">
                {JSON.stringify(
                  schema.strict 
                    ? content 
                    : content.__editorContent || content, 
                  null, 
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
