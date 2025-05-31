import React, { useState } from "react";
import { ContentItemEditor } from "@/components/Content/ContentItemEditor";
import { useParams, useNavigate } from "react-router-dom";
import { exampleSchemas, mockContentItems, ContentItem, ContentItemStatus, ContentItemComment } from "@/lib/contentSchema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Send, ThumbsUp, ThumbsDown, ArrowDown, ArrowUp, Plus, Reply, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ContentItemPage: React.FC = () => {
  const { schemaId, contentId } = useParams<{ schemaId: string; contentId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [inlineCommentText, setInlineCommentText] = useState("");
  const [diffView, setDiffView] = useState<"unified" | "split">("unified");
  
  // Find the schema based on the schemaId
  const schema = exampleSchemas.find(s => s.id === schemaId);
  
  // Find content item if contentId is provided
  const [contentItem, setContentItem] = useState<ContentItem | undefined>(
    contentId ? mockContentItems.find(item => item.id === contentId) : undefined
  );
  
  // Helper function to get content data (handles both content and data fields)
  const getContentData = (item?: ContentItem) => {
    if (!item) return {};
    return item.data || item.content || {};
  };
  
  // Mock previous version for diffing
  const [previousVersion] = useState<ContentItem | undefined>(() => {
    if (!contentItem) return undefined;
    
    const contentData = getContentData(contentItem);
    
    return {
      ...contentItem,
      content: {
        ...contentData,
        content: contentData.content?.replace("React is a JavaScript library", "React is a popular JavaScript library")
          .replace("helped me understand", "really helped me understand")
      },
      updatedAt: new Date(new Date(contentItem.updatedAt).getTime() - 86400000).toISOString() // 1 day before
    };
  });
  
  // Set up initial content
  const initialContent = getContentData(contentItem) || {
    title: "New Content",
    content: "# Add your content here\n\nStart editing to create your content.",
  };

  // Mock diff data for the example
  const mockDiffLines = previousVersion && contentItem ? [
    { type: "context", content: "# Introduction to React", lineNumber: 1 },
    { type: "context", content: "", lineNumber: 2 },
    { type: "deletion", content: "React is a popular JavaScript library for building user interfaces...", lineNumber: 3 },
    { type: "addition", content: "React is a JavaScript library for building user interfaces...", lineNumber: 3 },
    { type: "context", content: "It was developed by Facebook and is now maintained by Facebook and a community of developers.", lineNumber: 4 },
    { type: "context", content: "", lineNumber: 5 },
    { type: "context", content: "## Key Features", lineNumber: 6 },
    { type: "context", content: "", lineNumber: 7 },
    { type: "context", content: "* Component-based architecture", lineNumber: 8 },
    { type: "context", content: "* Virtual DOM for performance", lineNumber: 9 },
    { type: "context", content: "* JSX syntax", lineNumber: 10 },
    { type: "context", content: "", lineNumber: 11 },
    { type: "deletion", content: "This article really helped me understand the topic better.", lineNumber: 12 },
    { type: "addition", content: "This article helped me understand the topic better.", lineNumber: 12 },
  ] : [];

  // Mock inline comments
  const [inlineComments, setInlineComments] = useState<{
    lineNumber: number;
    comments: Array<{
      id: string;
      text: string;
      author: string;
      authorAvatar: string;
      timestamp: string;
    }>;
  }[]>([
    {
      lineNumber: 3,
      comments: [
        {
          id: "inline-1",
          text: "I removed 'popular' to be more neutral in tone",
          author: "John Smith",
          authorAvatar: "/placeholder.svg",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    },
    {
      lineNumber: 12,
      comments: [
        {
          id: "inline-2",
          text: "Removed 'really' as it's redundant",
          author: "Jane Doe",
          authorAvatar: "/placeholder.svg",
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]
    }
  ]);
  
  const handleSave = (content: Record<string, any>, status?: ContentItemStatus) => {
    const newStatus = status || contentItem?.status || 'draft';
    
    if (contentItem) {
      // Update existing content item
      setContentItem({
        ...contentItem,
        content,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'published' && !contentItem.publishedAt ? { 
          publishedAt: new Date().toISOString(),
          publishedBy: 'current-user@example.com',
        } : {})
      });
    } else {
      // Create new content item
      const newItem: ContentItem = {
        id: crypto.randomUUID(),
        schemaId: schemaId || '',
        title: content.title || 'Untitled',
        content,
        status: newStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user@example.com',
        updatedBy: 'current-user@example.com',
        comments: []
      };
      
      setContentItem(newItem);
      // In a real app, we would push this to the database
    }
    
    toast({
      title: "Content saved",
      description: "The content has been saved successfully."
    });
  };
  
  const handleAddComment = () => {
    if (!newComment.trim() || !contentItem) return;
    
    const comment: ContentItemComment = {
      id: crypto.randomUUID(),
      contentItemId: contentItem.id,
      userId: 'current-user',
      userName: 'Current User',
      text: newComment,
      createdAt: new Date().toISOString()
    };
    
    setContentItem({
      ...contentItem,
      comments: [...(contentItem.comments || []), comment]
    });
    
    setNewComment("");
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to the review thread."
    });
  };
  
  const handleApproveContent = () => {
    if (!contentItem) return;
    
    setContentItem({
      ...contentItem,
      status: 'published',
      publishedAt: new Date().toISOString(),
      publishedBy: 'current-user@example.com'
    });
    
    toast({
      title: "Content approved",
      description: "The content has been approved and published."
    });
  };
  
  const handleRejectContent = () => {
    if (!contentItem) return;
    
    setContentItem({
      ...contentItem,
      status: 'draft'
    });
    
    toast({
      title: "Content needs revision",
      description: "The content has been returned to draft status."
    });
  };

  const handleAddInlineComment = () => {
    if (!inlineCommentText.trim() || selectedLine === null) return;

    const existingCommentsIndex = inlineComments.findIndex(c => c.lineNumber === selectedLine);
    
    if (existingCommentsIndex >= 0) {
      // Add to existing comments for this line
      const updatedComments = [...inlineComments];
      updatedComments[existingCommentsIndex] = {
        ...updatedComments[existingCommentsIndex],
        comments: [
          ...updatedComments[existingCommentsIndex].comments,
          {
            id: crypto.randomUUID(),
            text: inlineCommentText,
            author: "Current User",
            authorAvatar: "/placeholder.svg",
            timestamp: new Date().toISOString()
          }
        ]
      };
      setInlineComments(updatedComments);
    } else {
      // Create new comment thread for this line
      setInlineComments([
        ...inlineComments,
        {
          lineNumber: selectedLine,
          comments: [
            {
              id: crypto.randomUUID(),
              text: inlineCommentText,
              author: "Current User",
              authorAvatar: "/placeholder.svg",
              timestamp: new Date().toISOString()
            }
          ]
        }
      ]);
    }

    setInlineCommentText("");
    setSelectedLine(null);
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to line " + selectedLine
    });
  };
  
  if (!schema) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Schema Not Found</h1>
        <p className="mb-6">The content schema you requested was not found.</p>
        <Button onClick={() => navigate("/schemas")}>
          Go to Schemas
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/content")}
        >
          <ArrowLeft size={16} />
          Back to Content
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          {contentItem?.status === 'pending_review' && previousVersion ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Content Review</h2>
                <ToggleGroup type="single" value={diffView} onValueChange={(value) => value && setDiffView(value as "unified" | "split")}>
                  <ToggleGroupItem value="unified">Unified View</ToggleGroupItem>
                  <ToggleGroupItem value="split">Split View</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div className="border rounded-md">
                <div className="bg-muted p-3 border-b flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Comparing changes</span>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(previousVersion.updatedAt), "MMM d, yyyy")}</span>
                    <ArrowRight size={12} className="my-auto" />
                    <span>{format(new Date(contentItem.updatedAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {mockDiffLines.map((line, index) => {
                        const hasComments = inlineComments.some(c => c.lineNumber === line.lineNumber);
                        const lineComments = inlineComments.find(c => c.lineNumber === line.lineNumber)?.comments || [];
                        
                        return (
                          <React.Fragment key={`line-${index}`}>
                            <tr className={`
                              ${line.type === 'addition' ? 'bg-green-50' : ''}
                              ${line.type === 'deletion' ? 'bg-red-50' : ''}
                              ${selectedLine === line.lineNumber ? 'bg-blue-50' : ''}
                              hover:bg-muted/50 group
                            `}>
                              <td className="w-8 text-right text-muted-foreground px-3 py-0.5 select-none border-r">
                                {line.lineNumber}
                              </td>
                              <td className={`px-4 py-0.5 font-mono whitespace-pre ${
                                line.type === 'addition' ? 'text-green-700' :
                                line.type === 'deletion' ? 'text-red-700' : ''
                              }`}>
                                <span className="mr-2">
                                  {line.type === 'addition' ? '+' : 
                                   line.type === 'deletion' ? '-' : ' '}
                                </span>
                                {line.content}
                              </td>
                              <td className="w-10 px-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                  onClick={() => setSelectedLine(line.lineNumber)}
                                >
                                  <Plus size={14} />
                                </Button>
                              </td>
                            </tr>
                            
                            {/* Inline comments for this line */}
                            {hasComments && (
                              <tr>
                                <td className="w-8 border-r"></td>
                                <td colSpan={2} className="py-2 px-8 bg-muted/30">
                                  <div className="space-y-3">
                                    {lineComments.map(comment => (
                                      <div key={comment.id} className="flex gap-3">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={comment.authorAvatar} />
                                          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="bg-background border rounded-md p-2">
                                            <div className="flex justify-between items-center mb-1">
                                              <span className="font-medium text-xs">{comment.author}</span>
                                              <span className="text-xs text-muted-foreground">
                                                {format(new Date(comment.timestamp), "MMM d, h:mm a")}
                                              </span>
                                            </div>
                                            <p className="text-sm">{comment.text}</p>
                                          </div>
                                          <div className="mt-1 ml-2">
                                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                                              <Reply size={12} />
                                              Reply
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                            
                            {/* Comment input when a line is selected */}
                            {selectedLine === line.lineNumber && (
                              <tr>
                                <td className="w-8 border-r"></td>
                                <td colSpan={2} className="py-2 px-8 bg-blue-50">
                                  <div className="flex gap-3">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback>C</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                      <Textarea 
                                        value={inlineCommentText}
                                        onChange={(e) => setInlineCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="min-h-[80px] text-sm"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setSelectedLine(null)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button 
                                          size="sm"
                                          onClick={handleAddInlineComment}
                                          disabled={!inlineCommentText.trim()}
                                        >
                                          Add Comment
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  onClick={handleApproveContent}
                >
                  <ThumbsUp size={16} />
                  Approve Changes
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={handleRejectContent}
                >
                  <ThumbsDown size={16} />
                  Request Changes
                </Button>
              </div>
              
              <ContentItemEditor 
                schema={schema}
                initialContent={initialContent}
                contentItem={contentItem}
                onSave={handleSave}
                onAddComment={comment => handleAddComment()}
              />
            </div>
          ) : (
            <ContentItemEditor 
              schema={schema}
              initialContent={initialContent}
              contentItem={contentItem}
              onSave={handleSave}
              onAddComment={comment => handleAddComment()}
            />
          )}
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <MessageSquare size={18} />
              Review Comments
            </h3>
            
            {contentItem?.status === 'pending_review' && (
              <div className="flex gap-2 mb-4">
                <Button 
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  onClick={handleApproveContent}
                >
                  <ThumbsUp size={16} />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={handleRejectContent}
                >
                  <ThumbsDown size={16} />
                  Needs Revision
                </Button>
              </div>
            )}
            
            <div className="mb-4">
              <Badge variant={
                contentItem?.status === 'published' ? "default" : 
                contentItem?.status === 'pending_review' ? "secondary" : 
                "outline"
              }
              className={
                contentItem?.status === 'published' ? "bg-green-100 text-green-800" :
                contentItem?.status === 'pending_review' ? "bg-amber-100 text-amber-800" :
                ""
              }
              >
                {contentItem?.status === 'published' ? "Published" : 
                 contentItem?.status === 'pending_review' ? "Pending Review" : 
                 "Draft"}
              </Badge>
              
              {contentItem?.publishedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Published on {format(new Date(contentItem.publishedAt), "PPP")}
                </p>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <ScrollArea className="h-[400px] pr-4">
              {contentItem?.comments && contentItem.comments.length > 0 ? (
                <div className="space-y-4">
                  {contentItem.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), "PPp")}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Add a comment to start the review discussion.
                </p>
              )}
            </ScrollArea>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Textarea 
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none min-h-[80px]"
              />
              <Button
                className="w-full gap-2"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send size={16} />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentItemPage;
