import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, MessageSquare, Reply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ForumPost, Comment, Forum } from '@/types/comments';

// Mock data - to be replaced with real API calls
const getMockPost = (postId: string, forumId: string): ForumPost => ({
  id: postId,
  title: postId === '1' ? 'Welcome to the forum!' : 'How to get started',
  content: postId === '1' 
    ? 'This is the first post in this forum. Welcome everyone! We\'re excited to have you here and look forward to your contributions to the discussion.'
    : 'Here are some tips for getting started with this forum. Feel free to ask questions and engage with other members.',
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  views: 42,
  likes: 5,
  replies: 3,
  commentsCount: 3,
  forumId,
  author: {
    id: 'admin',
    name: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    status: 'active'
  },
  tags: ['announcement'],
  pinned: postId === '1'
});

const getMockForum = (forumId: string): Forum => ({
  id: forumId,
  name: `Forum ${forumId}`,
  description: 'A sample forum for testing',
  created_at: new Date().toISOString(),
  posts_count: 5,
  comments_count: 20
});

const getMockComments = (postId: string): Comment[] => [
  {
    id: '1',
    content: 'Great post! Thanks for sharing this information.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    contentId: postId,
    contentTitle: 'Post Comment',
    contentType: 'forum_post',
    author: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      status: 'active'
    }
  },
  {
    id: '2',
    content: 'I agree with this approach. Very helpful!',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    contentId: postId,
    contentTitle: 'Post Comment',
    contentType: 'forum_post',
    author: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      status: 'active'
    }
  },
  {
    id: '3',
    content: 'This is a reply to the first comment.',
    status: 'pending',
    parentId: '1',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    contentId: postId,
    contentTitle: 'Post Comment',
    contentType: 'forum_post',
    author: {
      id: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      status: 'active'
    }
  }
];

function PostCommentsPage() {
  const { postId, commentId } = useParams<{ 
    postId: string; 
    commentId?: string; 
  }>();
  const { toast } = useToast();
  const [forum, setForum] = useState<Forum | null>(null);
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!postId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Mock data loading
        setForum(getMockForum('1'));
        setPost(getMockPost(postId, '1'));
        setComments(getMockComments(postId));
      } catch (error) {
        console.error("Error loading post:", error);
        toast({
          title: "Error",
          description: "Failed to load post. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [postId, toast]);

  // Auto-scroll to specific comment if commentId is provided
  useEffect(() => {
    if (commentId && !loading) {
      const commentElement = document.getElementById(`comment-${commentId}`);
      if (commentElement) {
        setTimeout(() => {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          commentElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }, 100);
      }
    }
  }, [commentId, loading]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      // Mock comment submission (admin comment with user_author_id: null)
      const adminComment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        status: 'pending',
        createdAt: new Date().toISOString(),
        contentId: postId!,
        contentTitle: 'Post Comment',
        contentType: 'forum_post',
        author: {
          id: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          status: 'active'
        }
      };

      setComments([...comments, adminComment]);
      setNewComment('');
      
      toast({
        title: "Success",
        description: "Comment posted successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      // Mock reply submission (admin comment with user_author_id: null)
      const adminReply: Comment = {
        id: Date.now().toString(),
        content: replyContent,
        status: 'pending',
        createdAt: new Date().toISOString(),
        contentId: postId!,
        contentTitle: 'Post Comment',
        contentType: 'forum_post',
        parentId,
        author: {
          id: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          status: 'active'
        }
      };

      setComments([...comments, adminReply]);
      setReplyContent('');
      setReplyingTo(null);
      
      toast({
        title: "Success",
        description: "Reply posted successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderComment = (comment: Comment, isHighlighted = false) => (
    <div 
      key={comment.id}
      id={`comment-${comment.id}`}
      className={`p-4 border rounded-lg transition-all ${
        comment.parentId ? 'ml-8 border-l-2 border-l-blue-200' : ''
      } ${isHighlighted ? 'bg-blue-50' : ''}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {comment.author.id === 'admin' && (
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            )}
          </div>
          {!comment.parentId && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-700">{comment.content}</p>
        
        {replyingTo === comment.id && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleReplySubmit(comment.id)}
                disabled={!replyContent.trim()}
              >
                Post Reply
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post || !forum) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Post not found.</p>
          <Button asChild className="mt-4">
            <Link to="/community/forums">Back to Forums</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Separate top-level comments and replies
  const topLevelComments = comments.filter(c => !c.parentId);
  const getReplies = (commentId: string) => comments.filter(c => c.parentId === commentId);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/community/forums" className="hover:text-foreground">
          Forums
        </Link>
        <span>/</span>
        <Link 
          to="/community/forums" 
          className="hover:text-foreground"
        >
          Forums
        </Link>
        <span>/</span>
        <span className="text-foreground">{post.title}</span>
      </div>

      {/* Post Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {post.pinned && (
                  <Badge variant="secondary">Pinned</Badge>
                )}
                <CardTitle className="text-2xl">{post.title}</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{post.author.name}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length}</span>
                </div>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/community/forums">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forums
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{post.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post a Comment (as Admin)</CardTitle>
          <CardDescription>
            Comments posted through this interface will be marked as admin comments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Write your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
            Post Comment
          </Button>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {topLevelComments.map((comment) => {
                const replies = getReplies(comment.id);
                const isHighlighted = commentId === comment.id;
                
                return (
                  <div key={comment.id} className="space-y-2">
                    {renderComment(comment, isHighlighted)}
                    {replies.length > 0 && (
                      <div className="space-y-2">
                        {replies.map((reply) => 
                          renderComment(reply, commentId === reply.id)
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PostCommentsPage;