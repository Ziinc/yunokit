
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash, MoveUp, MoveDown, FileText, Image, Video, List, Heading, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIAssistPanel } from "./AIAssistPanel";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type BlockType = 
  | "heading" 
  | "paragraph" 
  | "image" 
  | "list" 
  | "quote"
  | "video";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, any>;
}

const initialBlocks: Block[] = [
  {
    id: "1",
    type: "heading",
    content: "Welcome to the Block Editor",
  },
  {
    id: "2",
    type: "paragraph",
    content: "This is a block-based editor that allows you to create rich content with different block types.",
  },
  {
    id: "3",
    type: "list",
    content: "- Add different types of blocks\n- Reorder blocks by dragging\n- Edit content with inline formatting",
  },
  {
    id: "4",
    type: "quote",
    content: "Block editors make content creation more intuitive and visual.",
  },
];

export const BlockEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBlockContentChange = (id: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const generateBlockId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: generateBlockId(),
      type,
      content: "",
    };

    // Default content based on block type
    if (type === "heading") newBlock.content = "New Heading";
    if (type === "paragraph") newBlock.content = "Write your content here...";
    if (type === "list") newBlock.content = "- Item 1\n- Item 2\n- Item 3";
    if (type === "quote") newBlock.content = "Add a quote here";
    if (type === "image") newBlock.content = "https://via.placeholder.com/800x400";
    if (type === "video") newBlock.content = "https://www.youtube.com/embed/dQw4w9WgXcQ";

    setBlocks([...blocks, newBlock]);
    setFocusedBlockId(newBlock.id);
    
    toast({
      title: "Block added",
      description: `Added a new ${type} block`,
    });
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    toast({
      title: "Block removed",
      description: "The block has been removed",
    });
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = () => {
    toast({
      title: "Content saved",
      description: "Your block content has been saved successfully",
    });
  };

  const applyAISuggestion = (suggestion: string) => {
    try {
      const parsedBlocks = JSON.parse(suggestion);
      if (Array.isArray(parsedBlocks)) {
        setBlocks(parsedBlocks.map(block => ({
          ...block,
          id: block.id || generateBlockId() // Ensure each block has an ID
        })));
        toast({
          title: "AI content applied",
          description: "The AI suggestion has been applied to your block editor",
        });
      }
    } catch (err) {
      toast({
        title: "Error applying AI content",
        description: "Could not parse the AI suggestion",
        variant: "destructive",
      });
    }
    setAiPanelOpen(false);
  };

  const renderBlockControls = (block: Block, index: number) => (
    <div className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={() => moveBlockUp(index)}
        disabled={index === 0}
      >
        <MoveUp size={16} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={() => moveBlockDown(index)}
        disabled={index === blocks.length - 1}
      >
        <MoveDown size={16} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-destructive hover:text-destructive/70" 
        onClick={() => removeBlock(block.id)}
      >
        <Trash size={16} />
      </Button>
    </div>
  );

  const renderBlockContent = (block: Block) => {
    const isFocused = focusedBlockId === block.id;
    
    switch (block.type) {
      case "heading":
        return (
          <div className="flex flex-col gap-2 w-full">
            <Input
              value={block.content}
              onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
              className="font-bold text-xl w-full"
              placeholder="Heading"
              onFocus={() => setFocusedBlockId(block.id)}
            />
          </div>
        );
      case "paragraph":
        return (
          <Textarea
            value={block.content}
            onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
            className="min-h-[100px] w-full"
            placeholder="Write your paragraph here..."
            onFocus={() => setFocusedBlockId(block.id)}
          />
        );
      case "list":
        return (
          <Textarea
            value={block.content}
            onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
            className="min-h-[100px] w-full font-mono"
            placeholder="- Item 1&#10;- Item 2&#10;- Item 3"
            onFocus={() => setFocusedBlockId(block.id)}
          />
        );
      case "quote":
        return (
          <div className="border-l-4 border-cms-purple pl-4 w-full">
            <Textarea
              value={block.content}
              onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
              className="italic min-h-[80px] w-full"
              placeholder="Enter a quote..."
              onFocus={() => setFocusedBlockId(block.id)}
            />
          </div>
        );
      case "image":
        return (
          <div className="flex flex-col gap-2 w-full">
            <Input
              value={block.content}
              onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
              placeholder="Enter image URL"
              className="w-full"
              onFocus={() => setFocusedBlockId(block.id)}
            />
            {block.content && (
              <div className="mt-2 rounded-md overflow-hidden border border-border">
                <img 
                  src={block.content} 
                  alt="Content preview" 
                  className="max-w-full h-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                  }}
                />
              </div>
            )}
          </div>
        );
      case "video":
        return (
          <div className="flex flex-col gap-2 w-full">
            <Input
              value={block.content}
              onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
              placeholder="Enter video embed URL"
              className="w-full"
              onFocus={() => setFocusedBlockId(block.id)}
            />
            {block.content && (
              <div className="mt-2 rounded-md overflow-hidden border border-border aspect-video">
                <iframe
                  src={block.content}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case "heading": return <Heading size={16} />;
      case "paragraph": return <FileText size={16} />;
      case "image": return <Image size={16} />;
      case "list": return <List size={16} />;
      case "quote": return <Quote size={16} />;
      case "video": return <Video size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Block Editor</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus size={16} />
                Add Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => addBlock("heading")}>
                <Heading size={16} className="mr-2" /> Heading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock("paragraph")}>
                <FileText size={16} className="mr-2" /> Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock("list")}>
                <List size={16} className="mr-2" /> List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock("quote")}>
                <Quote size={16} className="mr-2" /> Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock("image")}>
                <Image size={16} className="mr-2" /> Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock("video")}>
                <Video size={16} className="mr-2" /> Video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <div className="flex flex-1 gap-4 min-h-0">
        <div className={`flex-1 overflow-auto ${aiPanelOpen ? "w-1/2" : "w-full"}`}>
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <Card
                key={block.id}
                className={`p-4 transition-all duration-200 ${
                  focusedBlockId === block.id 
                    ? "ring-2 ring-primary" 
                    : "hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center text-muted-foreground">
                    {getBlockIcon(block.type)}
                    <span className="ml-2 text-sm capitalize">{block.type}</span>
                  </div>
                  <div className="ml-auto">
                    {renderBlockControls(block, index)}
                  </div>
                </div>
                <Separator className="mb-3" />
                {renderBlockContent(block)}
              </Card>
            ))}
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed border-2 text-muted-foreground hover:border-primary hover:text-primary"
              onClick={() => addBlock("paragraph")}
            >
              <Plus size={16} className="mr-2" />
              Add a new block
            </Button>
          </div>
        </div>

        {aiPanelOpen && (
          <Card className="w-1/2 p-4 overflow-auto border border-cms-orange/20">
            <AIAssistPanel 
              currentContent={JSON.stringify(blocks, null, 2)} 
              onApplySuggestion={applyAISuggestion} 
              editorType="block"
            />
          </Card>
        )}
      </div>
    </div>
  );
};
