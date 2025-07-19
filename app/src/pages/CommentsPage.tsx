import React, { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Comment } from "@/types/comments";
import CommentsTab from "@/components/Comments/CommentsTab";
import { getComments, approveComment, rejectComment, saveComment } from '@/lib/api/CommentsApi';

const CommentsPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [commentSearchQuery, setCommentSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Pagination state for comments
  const commentsPerPage = 10;
  const currentCommentsPage = 1;
  

  const [comments, setComments] = useState<Comment[]>([]);

  // Load comments from CommentsApi
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const response = await getComments();
        const fetchedComments = response.data || [];
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error loading comments:", error);
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [toast]);


  // Filter comments based on search query and tab
  const filteredComments = useMemo(() => {
    let filtered = comments || [];
    
    // Filter by search query
    if (commentSearchQuery) {
      filtered = filtered.filter(comment => 
        comment.content.toLowerCase().includes(commentSearchQuery.toLowerCase()) ||
        comment.author.name.toLowerCase().includes(commentSearchQuery.toLowerCase()) ||
        (comment.contentTitle && comment.contentTitle.toLowerCase().includes(commentSearchQuery.toLowerCase()))
      );
    }
    
    // Filter by tab
    switch (currentTab) {
      case "pending":
        filtered = filtered.filter(comment => comment.status === "pending");
        break;
      case "approved":
        filtered = filtered.filter(comment => comment.status === "approved");
        break;
      case "flagged":
        filtered = filtered.filter(comment => comment.status === "flagged");
        break;
      case "spam":
        filtered = filtered.filter(comment => comment.status === "spam");
        break;
      // "all" tab shows all comments
    }
    
    // Sort comments by creation date (newest first)
    return [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments, commentSearchQuery, currentTab]);

  // Get paginated comments
  const paginatedComments = useMemo(() => {
    const startIndex = (currentCommentsPage - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    return filteredComments.slice(startIndex, endIndex);
  }, [filteredComments, currentCommentsPage, commentsPerPage]);


  const handleApproveComment = async (commentId: string) => {
    try {
      await approveComment(commentId);
      
      const updatedComments = comments.map(comment =>
        comment.id === commentId ? { ...comment, status: "approved" as const } : comment
      );
      
      setComments(updatedComments);
      
      toast({
        title: "Comment approved",
        description: "The comment has been approved and is now visible.",
      });
    } catch (error) {
      console.error("Error approving comment:", error);
      toast({
        title: "Action failed",
        description: "There was an error approving the comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRejectComment = async (commentId: string) => {
    try {
      await rejectComment(commentId);
      
      const updatedComments = comments.map(comment =>
        comment.id === commentId ? { ...comment, status: "deleted" as const } : comment
      );
      
      setComments(updatedComments);
      
      toast({
        title: "Comment rejected",
        description: "The comment has been rejected and is now hidden.",
      });
    } catch (error) {
      console.error("Error rejecting comment:", error);
      toast({
        title: "Action failed",
        description: "There was an error rejecting the comment. Please try again.",
        variant: "destructive"
      });
    }
  };


  const handleSubmitReply = async () => {
    if (!selectedComment || !replyText.trim()) return;
    
    try {
      const newComment: Partial<Comment> = {
        parentId: selectedComment.id,
        content: replyText.trim(),
        contentId: selectedComment.contentId,
        contentTitle: selectedComment.contentTitle,
        contentType: selectedComment.contentType
      };
      
      // Save the comment using CommentsApi
      const response = await saveComment(newComment);
      const savedComment = response.data;
      
      // Update UI
      setComments([savedComment, ...comments]);
      setReplyText("");
      setSelectedComment(null);
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      console.error("Error posting reply:", error);
      toast({
        title: "Reply failed",
        description: "There was an error posting your reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReply = (comment: Comment) => {
    setSelectedComment(comment);
    setReplyText("");
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CommentsTab
          comments={paginatedComments}
          onApprove={handleApproveComment}
          onReject={handleRejectComment}
          onReply={handleReply}
          selectedComment={selectedComment}
          replyText={replyText}
          onReplyTextChange={setReplyText}
          onSubmitReply={handleSubmitReply}
          onCancelReply={() => {
            setSelectedComment(null);
            setReplyText("");
          }}
          searchQuery={commentSearchQuery}
          onSearchQueryChange={setCommentSearchQuery}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
        />
      )}
    </>
  );
};

export default CommentsPage;
