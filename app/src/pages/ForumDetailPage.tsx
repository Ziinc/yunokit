import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getForumById } from '@/lib/api/ForumsApi';
import { getPostsByForum } from '@/lib/api/PostsApi';
import { Forum } from '@/types/comments';


const ForumDetailPage: React.FC = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [forum, setForum] = useState<Forum | null>(null);

  interface ForumPost {
    id: number;
    title: string;
    content_data?: Record<string, unknown>;
    status: string;
    created_at: string;
    user_author_id?: string;
  }

  const [posts, setPosts] = useState<ForumPost[]>([]);
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
          
          // Load posts for this forum
          const postsResponse = await getPostsByForum(parseInt(forumId));
          if (postsResponse.data) {
            setPosts(postsResponse.data);
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
                <span>{posts.length} posts</span>
                <span>Created {new Date(forum.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button asChild>
              <Link to={`/community/forums/${forumId}/new-post`}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No posts found. Be the first to create a post!
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link 
                        to={`/community/posts/${post.id}`}
                        className="hover:underline"
                      >
                        <div className="font-medium line-clamp-2">
                          {post.title || (post.content_data?.title as string) || 'Untitled Post'}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{post.user_author_id || 'Anonymous'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{post.status || 'draft'}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(post.created_at).toLocaleDateString()}
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