
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentSchema, ContentField, ContentItem, ContentItemStatus, ContentItemComment } from "@/lib/contentSchema";
import { BooleanField } from "./Fields/BooleanField";
import { EnumField } from "./Fields/EnumField";
import { MultiselectField } from "./Fields/MultiselectField";
import { RelationField } from "./Fields/RelationField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, MessageSquare, Send, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentItemEditorProps {
  schema: ContentSchema;
  initialContent?: Record<string, any>;
  contentItem?: ContentItem;
  onSave: (content: Record<string, any>, status?: ContentItemStatus) => void;
  onPublish?: (content: Record<string, any>) => void;
  onRequestReview?: (content: Record<string, any>) => void;
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
  const [content, setContent] = useState<Record<string, any>>(initialContent);
  const [activeTab, setActiveTab] = useState<string>("fields");
  const [commentValue, setCommentValue] = useState("");
  const [fieldComments, setFieldComments] = useState<Record<string, string>>({});
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Status indicator
  const status = contentItem?.status || 'draft';
  
  // Determine if user can request review
  const canRequestReview = status === 'draft';
  
  // Determine if user can approve
  const canApprove = status === 'pending_review';

  // Initialize content with default values from schema
  useEffect(() => {
    const defaults: Record<string, any> = {};
    
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
              defaults[field.id] = "{}";
              break;
            case "block":
              defaults[field.id] = "[]";
              break;
            case "boolean":
              defaults[field.id] = false;
              break;
            case "enum":
              defaults[field.id] = field.options?.[0] || "";
              break;
            case "multiselect":
              defaults[field.id] = [];
              break;
            case "relation":
              defaults[field.id] = [];
              break;
          }
        }
      }
    });
    
    setContent(prevContent => ({ ...defaults, ...prevContent }));
  }, [schema, initialContent]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setContent(prevContent => ({
      ...prevContent,
      [fieldId]: value,
    }));
  };

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

  const handleAddFieldComment = (fieldId: string) => {
    const comment = fieldComments[fieldId];
    if (!comment || !comment.trim()) return;
    
    if (onAddComment) {
      onAddComment({
        contentItemId: contentItem?.id || '',
        userId: 'current-user',
        userName: 'You',
        text: comment,
        fieldId: fieldId,
        resolved: false
      });
    }
    
    setFieldComments(prev => ({ ...prev, [fieldId]: '' }));
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to the field",
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

  const renderField = (field: ContentField) => {
    const fieldComments = contentItem?.comments?.filter(c => c.fieldId === field.id) || [];
    
    const fieldContent = (
      <>
        {field.type === "markdown" && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{field.name}</h3>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-4">{field.description}</p>
            )}
            <div className="border rounded-md p-4">
              <Tabs defaultValue="edit">
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <Textarea
                    value={content[field.id] || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div 
                    className="prose dark:prose-invert max-w-none p-4"
                    dangerouslySetInnerHTML={{ 
                      __html: window.markdownit().render(content[field.id] || "") 
                    }} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        
        {field.type === "json" && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{field.name}</h3>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-4">{field.description}</p>
            )}
            <div className="border rounded-md p-4">
              <Textarea
                value={content[field.id] || "{}"}
                onChange={(e) => {
                  try {
                    // Check if it's valid JSON
                    JSON.parse(e.target.value);
                    handleFieldChange(field.id, e.target.value);
                  } catch (err) {
                    // Still update the field even if JSON is invalid
                    handleFieldChange(field.id, e.target.value);
                  }
                }}
                className="min-h-[200px] font-mono"
              />
            </div>
          </div>
        )}
        
        {field.type === "block" && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{field.name}</h3>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-4">{field.description}</p>
            )}
            <div className="border rounded-md p-4">
              <p className="text-sm text-muted-foreground mb-4">Block editor integration</p>
            </div>
          </div>
        )}
        
        {field.type === "boolean" && (
          <BooleanField
            id={field.id}
            name={field.name}
            value={content[field.id] || false}
            onChange={(value) => handleFieldChange(field.id, value)}
            description={field.description}
          />
        )}
        
        {field.type === "enum" && (
          <EnumField
            id={field.id}
            name={field.name}
            value={content[field.id] || ""}
            onChange={(value) => handleFieldChange(field.id, value)}
            options={field.options || []}
            description={field.description}
          />
        )}
        
        {field.type === "multiselect" && (
          <MultiselectField
            id={field.id}
            name={field.name}
            value={content[field.id] || []}
            onChange={(value) => handleFieldChange(field.id, value)}
            options={field.options || []}
            description={field.description}
          />
        )}
        
        {field.type === "relation" && (
          <RelationField
            id={field.id}
            name={field.name}
            schemaId={field.relationTarget || ""}
            value={content[field.id] || []}
            onChange={(value) => handleFieldChange(field.id, value)}
            description={field.description}
            isMultiple={field.isMultiple}
          />
        )}
      </>
    );
    
    // Add field comments if this is a review
    if (status === 'pending_review' || fieldComments.length > 0) {
      return (
        <div>
          {fieldContent}
          
          {/* Field comments section */}
          {fieldComments.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Comments</h4>
              <div className="space-y-3">
                {fieldComments.map(comment => (
                  <div key={comment.id} className="flex gap-3 text-sm">
                    <Avatar className="h-8 w-8">
                      <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs">
                        {comment.userName.charAt(0)}
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1">{comment.text}</p>
                    </div>
                    {!comment.resolved && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add comment form */}
          <div className="mt-4 flex gap-2">
            <Textarea
              placeholder={`Comment on ${field.name}...`}
              value={fieldComments[field.id] || ""}
              onChange={(e) => setFieldComments(prev => ({ ...prev, [field.id]: e.target.value }))}
              className="min-h-[80px] flex-1"
            />
            <Button 
              size="sm" 
              className="self-end"
              onClick={() => handleAddFieldComment(field.id)}
              disabled={!fieldComments[field.id]?.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }
    
    return fieldContent;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {schema.isCollection ? "Edit Item" : `Edit ${schema.name}`}
          </h1>
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
          {(contentItem?.comments?.length > 0 || status === 'pending_review') && (
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
              {contentItem?.comments?.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {contentItem.comments.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="fields" className="space-y-6 pt-4">
          {schema.fields.map((field) => (
            <Card key={field.id} className="overflow-hidden">
              <CardContent className="p-4">
                {renderField(field)}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="preview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schema.fields.map((field) => (
                  <div key={field.id}>
                    <h3 className="font-medium">{field.name}</h3>
                    <div className="mt-1 p-2 bg-muted rounded-md">
                      {field.type === "markdown" && (
                        <div 
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: window.markdownit().render(content[field.id] || "") 
                          }} 
                        />
                      )}
                      {field.type === "json" && (
                        <pre className="whitespace-pre-wrap text-sm">
                          {JSON.stringify(JSON.parse(content[field.id] || "{}"), null, 2)}
                        </pre>
                      )}
                      {field.type === "block" && (
                        <div className="text-sm">Block content preview</div>
                      )}
                      {field.type === "boolean" && (
                        <div>{content[field.id] ? "Yes" : "No"}</div>
                      )}
                      {field.type === "enum" && (
                        <div>{content[field.id]}</div>
                      )}
                      {field.type === "multiselect" && (
                        <div>{content[field.id]?.join(", ") || ""}</div>
                      )}
                      {field.type === "relation" && (
                        <div>
                          {content[field.id]?.length > 0 
                            ? `${content[field.id].length} related item(s)` 
                            : "No related items"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
              {contentItem?.comments?.filter(c => !c.fieldId).length > 0 ? (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {contentItem.comments
                      .filter(c => !c.fieldId)
                      .map(comment => (
                        <div key={comment.id} className="flex gap-3 p-3 border rounded-md">
                          <Avatar className="h-8 w-8">
                            <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs">
                              {comment.userName.charAt(0)}
                            </div>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{comment.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {!comment.resolved && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-green-600"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <p className="mt-2">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No general comments yet
                </div>
              )}
              
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
