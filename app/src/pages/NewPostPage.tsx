import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentItemEditor } from "@/components/Content/ContentItemEditor";
import { ContentSchemaRow } from "@/lib/api/SchemaApi";
import { createPost } from "@/lib/api/PostsApi";
import { Z_INDEX } from "@/lib/css-constants";

const NewPostPage = () => {
  const navigate = useNavigate();
  const { forumId } = useParams<{ forumId: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define a simple schema for posts with title and markdown content
  const postSchema: ContentSchemaRow = {
    id: 'post-schema',
    name: 'Post',
    strict: true,
    isCollection: false,
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'text',
        required: true,
        description: 'The title of your post'
      },
      {
        id: 'content',
        name: 'Content',
        type: 'markdown',
        required: true,
        description: 'The main content of your post'
      }
    ]
  };

  const handleSave = async (content: Record<string, unknown>) => {
    if (!forumId) {
      toast({
        title: "Error",
        description: "Forum ID is missing",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const postData = {
        title: content.title as string,
        content_data: content,
        forum_id: parseInt(forumId),
        status: 'published'
      };

      const { error } = await createPost(postData);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Post created",
        description: `Post "${content.title}" has been created successfully.`,
      });

      // Navigate back to forum detail page
      navigate(`/community/forums/${forumId}`);
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!forumId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Invalid forum ID.</p>
          <Button asChild className="mt-4">
            <Link to="/community/forums">Back to Forums</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/community/forums" className="hover:text-foreground">
          Forums
        </Link>
        <span>/</span>
        <Link to={`/community/forums/${forumId}`} className="hover:text-foreground">
          Forum
        </Link>
        <span>/</span>
        <span className="text-foreground">New Post</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/community/forums/${forumId}`} className="flex items-center gap-2">
            <ArrowLeft className="icon-sm" />
            Back to Forum
          </Link>
        </Button>
      </div>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentItemEditor
            schema={postSchema}
            initialContent={{}}
            onSave={handleSave}
          />
        </CardContent>
      </Card>

      {isSubmitting && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center ${Z_INDEX.modal}`}>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="icon-md animate-spin" />
              <span>Creating post...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NewPostPage;
