import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useToast } from "@/hooks/use-toast";

interface MonacoJSONEditorProps {
  content: string;
  onChange: (content: string) => void;
  height?: string;
}

export const MonacoJSONEditor: React.FC<MonacoJSONEditorProps> = ({
  content,
  onChange,
  height = "70vh"
}) => {
  const { toast } = useToast();
  const [editorContent, setEditorContent] = useState(content);

  // Keep local state in sync with parent
  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  const handleEditorChange = (value: string) => {
    setEditorContent(value);
    
    // Try to validate JSON
    try {
      JSON.parse(value);
      onChange(value);
    } catch (error) {
      // Don't trigger onChange for invalid JSON, but keep updating editor content
      console.error("Invalid JSON:", error);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(editorContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditorContent(formatted);
      onChange(formatted);
      
      toast({
        title: "JSON formatted",
        description: "Your JSON has been prettified",
      });
    } catch (error) {
      toast({
        title: "Format failed",
        description: "Invalid JSON cannot be formatted",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-2">
        <button 
          onClick={formatJSON} 
          className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-sm"
        >
          Format JSON
        </button>
      </div>
      <Editor
        height={height}
        defaultLanguage="json"
        value={editorContent}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
};
