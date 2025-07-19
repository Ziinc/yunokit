import React, { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ForumPost } from "@/types/comments";
import ForumTab from "@/components/Comments/ForumTab";

const PostsManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [postsSearchQuery, setPostsSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Mock data for now - this would come from API calls
  const [posts, setPosts] = useState<ForumPost[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        // const postsResponse = await getForumPosts();
        
        // Mock data for now
        setPosts([
          {
            id: "1",
            title: "Welcome to our community forum!",
            content: "This is the first post in our new community forum. Feel free to introduce yourself and share your thoughts.",
            status: "published",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 245,
            likes: 12,
            replies: 8,
            author: {
              id: "admin1",
              name: "Community Admin",
              avatar: "/placeholder.svg",
              status: "active"
            },
            tags: ["welcome", "announcement"],
            pinned: true
          },
          {
            id: "2",
            title: "Question about content management",
            content: "Hi everyone, I'm having trouble with content management. Can someone help me understand how to properly organize my content?",
            status: "published",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            views: 89,
            likes: 5,
            replies: 3,
            author: {
              id: "user1",
              name: "John Doe",
              avatar: "/placeholder.svg",
              status: "active"
            },
            tags: ["question", "content"],
            pinned: false
          },
          {
            id: "3",
            title: "Inappropriate content that needs review",
            content: "This post contains content that has been flagged by community members for review.",
            status: "flagged",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date(Date.now() - 7200000).toISOString(),
            views: 23,
            likes: 0,
            replies: 0,
            author: {
              id: "user2",
              name: "Flagged User",
              avatar: "/placeholder.svg",
              status: "restricted"
            },
            tags: ["flagged"],
            pinned: false
          }
        ]);
      } catch (error) {
        console.error("Error loading posts data:", error);
        toast({
          title: "Error",
          description: "Failed to load posts data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleDeletePost = async (postId: string) => {
    try {
      // TODO: API call to delete post
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
      
      toast({
        title: "Post deleted",
        description: "The post has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Action failed",
        description: "There was an error deleting the post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePinPost = async (postId: string, pinned: boolean) => {
    try {
      // TODO: API call to pin/unpin post
      const updatedPosts = posts.map(post =>
        post.id === postId ? { ...post, pinned } : post
      );
      setPosts(updatedPosts);
      
      toast({
        title: pinned ? "Post pinned" : "Post unpinned",
        description: pinned ? "The post has been pinned to the top." : "The post has been unpinned.",
      });
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Action failed",
        description: "There was an error updating the post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChangePostStatus = async (postId: string, status: "published" | "draft" | "archived" | "flagged") => {
    try {
      // TODO: API call to update post status
      const updatedPosts = posts.map(post =>
        post.id === postId ? { ...post, status } : post
      );
      setPosts(updatedPosts);
      
      toast({
        title: "Post updated",
        description: `Post status changed to ${status}.`,
      });
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Action failed",
        description: "There was an error updating the post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ForumTab
          posts={posts}
          postsSearchQuery={postsSearchQuery}
          setPostsSearchQuery={setPostsSearchQuery}
          handleDeletePost={handleDeletePost}
          handlePinPost={handlePinPost}
          handleChangePostStatus={handleChangePostStatus}
          formatDate={formatDate}
        />
      )}
    </>
  );
};

export default PostsManagementPage; 