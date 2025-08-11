import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getForumById } from '@/lib/api/ForumsApi';
import { getCommentsByForum } from '@/lib/api/CommentsApi';
import { Forum, Comment } from '@/types/comments';


const ForumDetailPage: React.FC = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [forum, setForum] = useState<Forum | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForum = async () => {
      if (!currentWorkspace?.id || !forumId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await getForumById(parseInt(forumId), currentWorkspace.id);
        
        if (data) {
          // Convert API response to our Forum type
          const forumData: Forum = {
            ...data,
            id: data.id.toString()
          };
          
          setForum(forumData);
          
          // Load comments for this forum
          const commentsResponse = await getCommentsByForum(forumId);
          if (commentsResponse.data) {
            setComments(commentsResponse.data);
          }
        }
      } catch (error) {
        console.error("Error loading forum:", error);
        toast({
          title: "Error",
          description: "Failed to load forum. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadForum();
  }, [currentWorkspace?.id, forumId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!forum) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Forum not found.</p>
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
        <Link to="/community/forums" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Forums
        </Link>
        <span>/</span>
        <span className="text-foreground">{forum.name}</span>
      </div>

      {/* Forum Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{forum.name}</CardTitle>
              {forum.description && (
                <CardDescription className="text-base">
                  {forum.description}
                </CardDescription>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{comments.length} comments</span>
                <span>Created {new Date(forum.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No comments found. Be the first to create a comment!
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment) => (
                  <TableRow key={comment.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link 
                        to={`/community/posts/${comment.id}`}
                        className="hover:underline"
                      >
                        <div className="font-medium line-clamp-2">
                          {comment.content.substring(0, 100)}{comment.content.length > 100 ? '...' : ''}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{comment.user_author_id || 'Admin'}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumDetailPage;