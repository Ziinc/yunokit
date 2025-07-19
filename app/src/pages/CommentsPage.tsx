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

  const handleFlagComment = async (commentId: string) => {
    try {
      // TODO: Implement flagComment API call
      const updatedComments = comments.map(comment =>
        comment.id === commentId ? { ...comment, status: "flagged" as const } : comment
      );
      
      setComments(updatedComments);
      
      toast({
        title: "Comment flagged",
        description: "The comment has been flagged for review.",
      });
    } catch (error) {
      console.error("Error flagging comment:", error);
      toast({
        title: "Action failed",
        description: "There was an error flagging the comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // TODO: Implement deleteComment API call
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);
      
      toast({
        title: "Comment deleted",
        description: "The comment has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Action failed",
        description: "There was an error deleting the comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      // TODO: Implement banUser API call
      const updatedComments = comments.map(comment =>
        comment.author.id === userId 
          ? { ...comment, author: { ...comment.author, status: "banned" as const } }
          : comment
      );
      
      setComments(updatedComments);
      
      toast({
        title: "User banned",
        description: "The user has been banned from commenting.",
      });
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Action failed",
        description: "There was an error banning the user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action: string, commentIds: string[]) => {
    try {
      let updatedComments = [...comments];
      
      switch (action) {
        case "approve":
          // TODO: Implement bulk approve API call
          updatedComments = comments.map(comment =>
            commentIds.includes(comment.id) 
              ? { ...comment, status: "approved" as const }
              : comment
          );
          break;
        case "reject":
          // TODO: Implement bulk reject API call
          updatedComments = comments.map(comment =>
            commentIds.includes(comment.id) 
              ? { ...comment, status: "deleted" as const }
              : comment
          );
          break;
        case "flag":
          // TODO: Implement bulk flag API call
          updatedComments = comments.map(comment =>
            commentIds.includes(comment.id) 
              ? { ...comment, status: "flagged" as const }
              : comment
          );
          break;
        case "delete":
          // TODO: Implement bulk delete API call
          updatedComments = comments.filter(comment => !commentIds.includes(comment.id));
          break;
      }
      
      setComments(updatedComments);
      
      toast({
        title: "Bulk action completed",
        description: `${commentIds.length} comments ${action}d successfully.`,
      });
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast({
        title: "Bulk action failed",
        description: "There was an error performing the bulk action. Please try again.",
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
          onBanUser={handleBanUser}
          onFlagComment={handleFlagComment}
          onDeleteComment={handleDeleteComment}
          onBulkAction={handleBulkAction}
        />
      )}
    </>
  );
};

export default CommentsPage;
