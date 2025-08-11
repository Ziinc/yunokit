import React, { useState } from "react";
import { ContentItemEditor } from "@/components/Content/ContentItemEditor";
import { useParams, useNavigate } from "react-router-dom";
import { ContentItem, ContentItemStatus, ContentItemComment, ContentField } from "@/lib/contentSchema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare, Send, ThumbsUp, ThumbsDown, Plus, ArrowRight, FileX2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { BackIconButton } from "@/components/ui/BackIconButton";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getSchema, ContentSchemaRow } from "@/lib/api/SchemaApi";
import {
  createContentItem,
  updateContentItem,
  getContentItemById,
  listContentItemVersions
} from "@/lib/api/ContentApi";
import ContentItemHistoryPanel from "@/components/Content/ContentItemHistoryPanel";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import useSWR from "swr";
import type { Json } from "../../database.types";

const ContentItemPage: React.FC = () => {
  const { contentId, schemaId } = useParams<{ contentId?: string; schemaId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [newComment, setNewComment] = useState("");
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [inlineCommentText, setInlineCommentText] = useState("");
  const [diffView, setDiffView] = useState<"unified" | "split">("unified");
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const contentIdNumber = contentId ? Number(contentId) : null;
  const schemaIdNumber = schemaId ? Number(schemaId) : null;
  
  // Load content item if editing existing
  const { 
    data: contentItemResponse, 
    error: contentItemError, 
    isLoading: isLoadingContentItem,
    mutate: mutateContentItem
  } = useSWR(
    currentWorkspace && contentIdNumber ? `content-item-${contentIdNumber}` : null,
    () => getContentItemById(contentIdNumber!, currentWorkspace!.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const contentItemData = contentItemResponse?.data;
  
  // Load schema from database
  const { 
    data: schemaResponse, 
    error: schemaError, 
    isLoading: isLoadingSchema 
  } = useSWR(
    currentWorkspace && (contentItemData?.schema_id || schemaIdNumber) ? 
      `schema-${contentItemData?.schema_id || schemaIdNumber}` : null,
    () => {
      const targetSchemaId = contentItemData?.schema_id || schemaIdNumber;
      if (targetSchemaId && currentWorkspace) {
        return getSchema(targetSchemaId, currentWorkspace.id);
      }
      return null;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const schema: ContentSchemaRow | undefined = schemaResponse?.data;
  

  // Convert database row to ContentItem format
  const contentItem: ContentItem | undefined = contentItemData ? {
    id: contentItemData.id.toString(),
    schemaId: contentItemData.schema_id?.toString() || '',
    title: contentItemData.title || 'Untitled',
    status: 'draft' as ContentItemStatus, // Map from database status if available
    createdAt: contentItemData.created_at,
    updatedAt: contentItemData.updated_at || contentItemData.created_at,
    publishedAt: contentItemData.published_at || undefined,
    data: (contentItemData.data as Record<string, unknown>) || {},
  } : undefined;
  
  // Helper function to get content data (handles both content and data fields)
  const getContentData = (item?: ContentItem) => {
    if (!item) return {};
    return item.data || {};
  };
  
  // Set up initial content
  const initialContent = getContentData(contentItem) || {};

  const { data: historyResponse } = useSWR(
    historyOpen && currentWorkspace && contentIdNumber
      ? `content-item-history-${contentIdNumber}`
      : null,
    () => listContentItemVersions(contentIdNumber!, currentWorkspace!.id),
    { revalidateOnFocus: false }
  );

  // Mock previous version for diffing (for demo purposes)
  const [previousVersion] = useState<ContentItem | undefined>(() => {
    if (!contentItem) return undefined;
    
    const contentData = getContentData(contentItem);
    
    return {
      ...contentItem,
      data: {
        ...contentData,
        content: typeof contentData.content === 'string' 
          ? contentData.content.replace("React is a JavaScript library", "React is a popular JavaScript library")
              .replace("helped me understand", "really helped me understand")
          : contentData.content
      },
      updatedAt: new Date(new Date(contentItem.updatedAt).getTime() - 86400000).toISOString() // 1 day before
    };
  });

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

  // Mock comments for demo purposes
  const [comments, setComments] = useState<ContentItemComment[]>([]);
  
  const handleSave = async (
    content: Record<string, unknown>,
    status?: ContentItemStatus
  ) => {
    if (!currentWorkspace || !schemaIdNumber) {
      toast({
        title: "Error",
        description: "Workspace or schema not found",
        variant: "destructive",
      });
      return;
    }

    if (!contentIdNumber && schema?.archived_at) {
      toast({
        title: "Schema archived",
        description: "Cannot create content for an archived schema.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newStatus = status || 'draft';
      const title = content.title || 'Untitled';
      
      if (contentIdNumber) {
        // Update existing content item
        const updateData = {
          title: title as string,
          data: content as Json,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'published' && !contentItem?.publishedAt ? { 
            published_at: new Date().toISOString(),
          } : {})
        };
        
        await updateContentItem(contentIdNumber, updateData, currentWorkspace.id);
        
        toast({
          title: "Content updated",
          description: "The content has been updated successfully."
        });
      } else {
        // Create new content item
        const createData = {
          schema_id: schemaIdNumber,
          title: title as string,
          data: content as Json,
          ...(newStatus === 'published' ? { 
            published_at: new Date().toISOString(),
          } : {})
        };
        
        const response = await createContentItem(createData, currentWorkspace.id);
        
        if (response.data) {
          // Navigate to the edit page for the newly created item
          navigate(`/manager/editor/${schemaId}/${response.data.id}`);
        }
        
        toast({
          title: "Content created",
          description: "The content has been created successfully."
        });
      }
      
      // Refresh the content item data
      mutateContentItem();
      
    } catch (error) {
      console.error('Error saving content item:', error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddComment = () => {
    if (!newComment.trim() || !contentItem) return;
    
    // TODO: Implement comment saving to database
    const comment: ContentItemComment = {
      id: crypto.randomUUID(),
      contentItemId: contentItem.id,
      userId: 'current-user',
      userName: 'Current User',
      text: newComment,
      createdAt: new Date().toISOString()
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment("");
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to the review thread."
    });
  };
  
  const handleApproveContent = async () => {
    if (!contentItem || !currentWorkspace || !contentIdNumber) return;
    
    try {
      await updateContentItem(
        contentIdNumber, 
        {
          published_at: new Date().toISOString(),
        }, 
        currentWorkspace.id
      );
      
      mutateContentItem();
      
      toast({
        title: "Content approved",
        description: "The content has been approved and published."
      });
    } catch (error) {
      console.error('Error approving content:', error);
      toast({
        title: "Error",
        description: "Failed to approve content. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleRejectContent = async () => {
    if (!contentItem || !currentWorkspace || !contentIdNumber) return;
    
    try {
      await updateContentItem(
        contentIdNumber, 
        {
          published_at: null,
        }, 
        currentWorkspace.id
      );
      
      mutateContentItem();
      
      toast({
        title: "Content needs revision",
        description: "The content has been returned to draft status."
      });
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast({
        title: "Error",
        description: "Failed to reject content. Please try again.",
        variant: "destructive",
      });
    }
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
      title: "Inline comment added",
      description: "Your comment has been added to this line."
    });
  };

  // Show loading state
  if (isLoadingSchema || (contentId && isLoadingContentItem)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (schemaError || contentItemError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading content</p>
          <BackIconButton label="Back to manager" onClick={() => navigate('/manager')} />
        </div>
      </div>
    );
  }

  // Show schema not found
  if (!schema) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Schema not found</p>
          <BackIconButton label="Back to manager" onClick={() => navigate('/manager')} />
        </div>
      </div>
    );
  }

  // Show content item not found
  if (contentId && !contentItem) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/manager')}
                >
                  <ChevronLeft size={16} />
                  <span className="sr-only">Back</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent />
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <FileX2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="mt-4 text-muted-foreground">Content item not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Convert schema to the expected format
  const contentSchema = schema ? {
    id: schema.id.toString(),
    name: schema.name || 'Untitled Schema',
    description: schema.description || undefined,
    fields: (schema.fields || []).map(field => ({
      id: field.id,
      name: field.label,
      type: field.type,
      required: field.required,
      description: field.description || undefined,
      defaultValue: field.default_value,
      options: field.options || [],
      relationSchemaId: field.relation_schema_id || undefined,
    } as ContentField)),
    isCollection: schema.type === 'collection',
    type: schema.type || 'collection'
  } : null;

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackIconButton label="Back to manager" onClick={() => navigate('/manager')} />
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {contentId ? 'Edit Content' : 'Create Content'} - {schema.name}
          </h1>
          <p className="text-muted-foreground">
            {contentId ? 'Update your content item' : 'Create a new content item'}
          </p>
        </div>
        {contentId && (
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
            History
          </Button>
        )}
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

                <ScrollArea className="h-96">
                  <div className="p-4 space-y-1 font-mono text-sm">
                    {mockDiffLines.map((line, index) => {
                      const hasComments = inlineComments.some(c => c.lineNumber === line.lineNumber);
                      
                      return (
                        <div key={index} className="group">
                          <div 
                            className={`flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-muted/50 ${
                              selectedLine === line.lineNumber ? 'bg-blue-50 border border-blue-200' : ''
                            } ${
                              line.type === 'addition' ? 'bg-green-50 text-green-800' : 
                              line.type === 'deletion' ? 'bg-red-50 text-red-800' : 
                              'text-muted-foreground'
                            }`}
                            onClick={() => setSelectedLine(line.lineNumber)}
                          >
                            <span className="w-8 text-xs text-right">{line.lineNumber}</span>
                            <span className="w-4">
                              {line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' '}
                            </span>
                            <span className="flex-1">{line.content}</span>
                            {hasComments && (
                              <MessageSquare size={12} className="text-blue-500" />
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLine(line.lineNumber);
                              }}
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                          
                          {/* Inline comments for this line */}
                          {inlineComments
                            .filter(c => c.lineNumber === line.lineNumber)
                            .map(commentGroup => (
                              <div key={commentGroup.lineNumber} className="ml-12 mt-2 space-y-2">
                                {commentGroup.comments.map(comment => (
                                  <div key={comment.id} className="flex gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={comment.authorAvatar} />
                                      <AvatarFallback className="text-xs">
                                        {comment.author.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-sm">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{comment.author}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {format(new Date(comment.timestamp), "MMM d, h:mm a")}
                                        </span>
                                      </div>
                                      <p>{comment.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Add inline comment form */}
                {selectedLine !== null && (
                  <div className="border-t p-4 bg-muted/30">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={`Add a comment to line ${selectedLine}...`}
                        value={inlineCommentText}
                        onChange={(e) => setInlineCommentText(e.target.value)}
                        className="flex-1 min-h-[60px]"
                      />
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleAddInlineComment}
                          disabled={!inlineCommentText.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedLine(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {contentSchema && (
                <ContentItemEditor 
                  schema={contentSchema}
                  initialContent={initialContent}
                  contentItem={contentItem}
                  onSave={handleSave}
                  onAddComment={() => handleAddComment()}
                />
              )}
            </div>
          ) : (
            contentSchema && (
              <ContentItemEditor 
                schema={contentSchema}
                initialContent={initialContent}
                contentItem={contentItem}
                onSave={handleSave}
                onAddComment={() => handleAddComment()}
              />
            )
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
            
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-muted rounded-md">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[80px]"
              />
              <Button 
                size="sm" 
                className="self-end"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
      <ContentItemHistoryPanel
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </>
  );
};

export default ContentItemPage;
