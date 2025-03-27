
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AIAssistPanel } from "./AIAssistPanel";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonacoJSONEditor } from "./MonacoJSONEditor";

const defaultJSON = `{
  "title": "Sample JSON Data",
  "description": "This is an example of JSON data that you can edit",
  "sections": [
    {
      "id": 1,
      "name": "Introduction",
      "content": "Welcome to the JSON editor!"
    },
    {
      "id": 2,
      "name": "Features",
      "content": "Edit and validate JSON with ease"
    }
  ],
  "metadata": {
    "author": "SupaContent User",
    "createdAt": "2023-08-01T12:00:00Z",
    "tags": ["json", "editor", "example"]
  }
}`;

export const JSONEditor: React.FC = () => {
  const [content, setContent] = useState(defaultJSON);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    validateJSON(newContent);
  };

  const validateJSON = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid JSON");
      }
    }
  };

  const handleSave = () => {
    if (error) {
      toast({
        title: "Cannot save invalid JSON",
        description: "Please fix the JSON errors before saving",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Content saved",
      description: "Your JSON content has been saved successfully",
    });
  };

  const formatJSON = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      setContent(formatted);
      setError(null);
      toast({
        title: "JSON formatted",
        description: "Your JSON has been prettified",
      });
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: "Format failed",
          description: err.message,
          variant: "destructive",
        });
      }
    }
  };

  const applyAISuggestion = (suggestion: string) => {
    setContent(suggestion);
    validateJSON(suggestion);
    setAiPanelOpen(false);
    toast({
      title: "AI content applied",
      description: "The AI suggestion has been applied to your editor",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">JSON Editor</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={formatJSON}
            className="border-cms-blue text-cms-blue hover:bg-cms-blue-light"
          >
            Format JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className={aiPanelOpen ? "bg-primary text-primary-foreground" : ""}
          >
            AI Assist
          </Button>
          <Button onClick={handleSave} disabled={!!error}>Save Content</Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 gap-4 h-full">
        <div className={`flex-1 flex flex-col ${aiPanelOpen ? "w-1/2" : "w-full"}`}>
          <Tabs defaultValue="edit" className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="tree">Tree View</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="flex-1 p-0">
              <MonacoJSONEditor 
                content={content} 
                onChange={handleContentChange} 
              />
            </TabsContent>
            <TabsContent value="tree" className="flex-1 overflow-auto bg-white dark:bg-card border rounded-md p-6">
              <pre className="text-sm">
                {!error ? (
                  JSON.stringify(JSON.parse(content), null, 2)
                ) : (
                  "Invalid JSON - Cannot display tree view"
                )}
              </pre>
            </TabsContent>
          </Tabs>
        </div>

        {aiPanelOpen && (
          <Card className="w-1/2 p-4 overflow-auto border border-cms-blue/20">
            <AIAssistPanel 
              currentContent={content} 
              onApplySuggestion={applyAISuggestion} 
              editorType="json"
            />
          </Card>
        )}
      </div>
    </div>
  );
};
