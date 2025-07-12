
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AIAssistPanel } from "./AIAssistPanel";
import { Card } from "@/components/ui/card";
import { TipTapEditor } from "./TipTapEditor";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const defaultMarkdown = `<h1>Hello, Markdown Editor!</h1>
<p>This is a <strong>markdown</strong> editor with preview. Try it out!</p>
<h2>Features</h2>
<ul>
  <li>Markdown syntax highlighting</li>
  <li>Preview pane</li>
  <li>AI-assisted content generation</li>
</ul>
<blockquote>
  <p>You can edit this content or use AI to help generate new content.</p>
</blockquote>
`;

export const MarkdownEditor: React.FC = () => {
  const [content, setContent] = useState(defaultMarkdown);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false);
  const { toast } = useToast();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSave = () => {
    toast({
      title: "Content saved",
      description: "Your markdown content has been saved successfully",
    });
  };

  const applyAISuggestion = (suggestion: string) => {
    setContent(suggestion);
    setAiPanelOpen(false);
    toast({
      title: "AI content applied",
      description: "The AI suggestion has been applied to your editor",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Markdown Editor</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAssetLibraryOpen(true)}
          >
            Assets
          </Button>
          <Button
            variant="outline"
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className={aiPanelOpen ? "bg-primary text-primary-foreground" : ""}
          >
            AI Assist
          </Button>
          <Button onClick={handleSave}>Save Content</Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 h-full">
        <div className={`flex-1 flex flex-col ${aiPanelOpen ? "w-1/2" : "w-full"}`}>
          <Tabs defaultValue="edit" className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="flex-1 p-0">
              <TipTapEditor 
                content={content} 
                onChange={handleContentChange}
                onOpenAssetLibrary={() => setAssetLibraryOpen(true)}
              />
            </TabsContent>
            <TabsContent value="preview" className="flex-1 overflow-auto bg-white dark:bg-card border rounded-md p-6">
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            </TabsContent>
            <TabsContent value="html" className="flex-1 p-0">
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[70vh] font-mono p-4 resize-none"
              />
            </TabsContent>
          </Tabs>
        </div>

        {aiPanelOpen && (
          <Card className="w-1/2 p-4 overflow-auto border border-cms-purple/20">
            <AIAssistPanel 
              currentContent={content} 
              onApplySuggestion={applyAISuggestion} 
              editorType="markdown"
            />
          </Card>
        )}
      </div>

      {/* Asset Library Dialog - would be replaced with a real asset library integration */}
      <Dialog open={assetLibraryOpen} onOpenChange={setAssetLibraryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Asset Library</DialogTitle>
            <DialogDescription>
              Select an asset to insert into your content.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground py-8">
              This is a placeholder for the Asset Library integration.
              Navigate to the Assets page from the sidebar to manage your assets.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
