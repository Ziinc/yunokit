
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentSchema, ContentItem, ContentItemStatus, ContentItemComment } from "@/lib/contentSchema";
import { TiptapEditor } from "./TiptapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Send, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import markdownit from 'markdown-it';

interface ContentItemEditorProps {
  schema: ContentSchema;
  initialContent?: Record<string, unknown>;
  contentItem?: ContentItem;
  onSave: (content: Record<string, unknown>, status?: ContentItemStatus) => void;
  onPublish?: (content: Record<string, unknown>) => void;
  onRequestReview?: (content: Record<string, unknown>) => void;
  onAddComment?: (comment: Omit<ContentItemComment, 'id' | 'createdAt'>) => void;
}

export const ContentItemEditor: React.FC<ContentItemEditorProps> = ({
  schema,
  initialContent = {},
  contentItem,
  onSave,
  onPublish,
  onRequestReview,
  onAddComment,
}) => {
  const { toast } = useToast();
  const [content, setContent] = useState<Record<string, unknown>>(initialContent);
  const [activeTab, setActiveTab] = useState<string>("fields");
  const [commentValue, setCommentValue] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Status indicator
  const status = contentItem?.status || 'draft';
  
  // Determine if user can request review
  const canRequestReview = status === 'draft';
  
  // Determine if user can approve
  const canApprove = status === 'pending_review';

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


  const handleSave = (newStatus?: ContentItemStatus) => {
    // Validate required fields
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
    
    onSave(content, newStatus);
    
    toast({
      title: "Content saved",
      description: "Your content has been saved successfully",
    });
  };

  const handleRequestReview = () => {
    if (onRequestReview) {
      onRequestReview(content);
      setReviewDialogOpen(false);
      
      toast({
        title: "Review requested",
        description: "Your content has been submitted for review",
      });
    } else {
      handleSave('pending_review');
      setReviewDialogOpen(false);
    }
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish(content);
      
      toast({
        title: "Content published",
        description: "Your content has been published successfully",
      });
    } else {
      handleSave('published');
    }
  };

  const handleAddComment = () => {
    if (!commentValue.trim()) return;
    
    if (onAddComment) {
      onAddComment({
        contentItemId: contentItem?.id || '',
        userId: 'current-user',
        userName: 'You',
        text: commentValue,
        fieldId: undefined,
        resolved: false
      });
    }
    
    setCommentValue('');
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to the review",
    });
  };



  const renderStatusBadge = () => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending_review':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Pending Review</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Published</Badge>;
      default:
        return null;
    }
  };

  const handleTiptapChange = (newContent: Record<string, unknown>) => {
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
          {renderStatusBadge()}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave()}>Save Draft</Button>
          
          {canRequestReview && (
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button>Request Review</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Content Review</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a comment to your review request to help reviewers understand what to focus on.
                  </p>
                  <Textarea
                    placeholder="Add any notes for reviewers..."
                    value={commentValue}
                    onChange={(e) => setCommentValue(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRequestReview}>
                    Submit for Review
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {canApprove && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handlePublish}>
              Publish
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="fields">Content Fields</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
          {status === 'pending_review' && (
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="fields" className="space-y-6 pt-4">
          <TiptapEditor
            schema={schema}
            content={content}
            onChange={handleTiptapChange}
            editable={true}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Show all fields from content, including dynamic ones */}
                {Object.entries(content).map(([fieldId, value]) => {
                  // Skip metadata field
                  if (fieldId === '__dynamicFields') return null;
                  
                  // Find field definition in schema or treat as dynamic
                  const schemaField = schema.fields.find(f => f.id === fieldId);
                  const dynamicFieldMetadata = content.__dynamicFields?.[fieldId];
                  
                  // Use stored metadata for dynamic fields, otherwise use schema field or fallback
                  const fieldName = schemaField?.name || 
                                  dynamicFieldMetadata?.name || 
                                  fieldId.replace('field_', '').replace(/_/g, ' ');
                  const fieldType = schemaField?.type || 
                                  dynamicFieldMetadata?.type || 
                                  'text';
                  const isDynamic = !schemaField;
                  
                  return (
                    <div key={fieldId}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{fieldName}</h3>
                        {isDynamic && (
                          <Badge variant="outline" className="text-xs">
                            Dynamic
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 p-2 bg-muted rounded-md">
                        {fieldType === "markdown" && (
                          <div 
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: markdownit().render(value || "") 
                            }} 
                          />
                        )}
                        {fieldType === "json" && (
                          <pre className="whitespace-pre-wrap text-sm">
                            {JSON.stringify(typeof value === 'string' ? JSON.parse(value || "{}") : value, null, 2)}
                          </pre>
                        )}
                        {fieldType === "boolean" && (
                          <div>{value ? "Yes" : "No"}</div>
                        )}
                        {fieldType === "enum" && (
                          <div>{value}</div>
                        )}
                        {fieldType === "multiselect" && (
                          <div>{Array.isArray(value) ? value.join(", ") : ""}</div>
                        )}
                        {fieldType === "relation" && (
                          <div>
                            {Array.isArray(value) && value.length > 0 
                              ? `${value.length} related item(s)` 
                              : "No related items"}
                          </div>
                        )}
                        {(fieldType === "text" || fieldType === "number" || fieldType === "date") && (
                          <div>{value || <span className="text-muted-foreground">No value</span>}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="json" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Representation</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm overflow-auto max-h-[600px]">
                {JSON.stringify(content, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comments" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No general comments yet
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Add a Comment</h3>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add your comment..."
                    value={commentValue}
                    onChange={(e) => setCommentValue(e.target.value)}
                    className="min-h-[100px] flex-1"
                  />
                  <Button 
                    size="sm" 
                    className="self-end"
                    onClick={handleAddComment}
                    disabled={!commentValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
