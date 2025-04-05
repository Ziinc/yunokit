import React, { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Flag, Shield, MessageSquare, Users, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Comment, Report, BannedWord, ForumPost, ChatMessage, ChatChannel, User } from "@/types/comments";
import CommentsTab from "@/components/Comments/CommentsTab";
import ReportsTab from "@/components/Comments/ReportsTab";
import ModerationTab from "@/components/Comments/ModerationTab";
import ForumTab from "@/components/Comments/ForumTab";
import ChatTab from "@/components/Comments/ChatTab";
import UsersTab from "@/components/Comments/UsersTab";
import { formatDate } from "@/utils/formatDate";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "@/components/Content/ContentList/PaginationControls";
import { CommentsApi } from "@/lib/api";

const CommentsPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [replyText, setReplyText] = useState("");
  const [bannedWordText, setBannedWordText] = useState("");
  const [bannedWordAction, setBannedWordAction] = useState<"flag" | "delete" | "ban">("flag");
  const [currentTab, setCurrentTab] = useState("all");
  const [commentSearchQuery, setCommentSearchQuery] = useState("");
  const [reportsSearchQuery, setReportsSearchQuery] = useState("");
  const [postsSearchQuery, setPostsSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Pagination state for comments
  const [commentsPerPage, setCommentsPerPage] = useState(10);
  const [currentCommentsPage, setCurrentCommentsPage] = useState(1);
  
  // Pagination state for forum posts
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [currentPostsPage, setCurrentPostsPage] = useState(1);
  
  // Pagination state for chat messages
  const [messagesPerPage, setMessagesPerPage] = useState(10);
  const [currentMessagesPage, setCurrentMessagesPage] = useState(1);
  
  // Pagination state for users
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  
  // Pagination state for reports
  const [reportsPerPage, setReportsPerPage] = useState(10);
  const [currentReportsPage, setCurrentReportsPage] = useState(1);
  
  // Pagination state for banned words
  const [bannedWordsPerPage, setBannedWordsPerPage] = useState(10);
  const [currentBannedWordsPage, setCurrentBannedWordsPage] = useState(1);

  const [comments, setComments] = useState<Comment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([]);

  // Load comments from CommentsApi
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const fetchedComments = await CommentsApi.getComments();
        setComments(fetchedComments);

        // For now, we'll keep using mock data for reports and banned words
        // In a real app, these would come from their own API endpoints
        setReports([
          {
            id: "r1",
            type: "comment",
            targetId: "5",
            targetName: "Flagged User",
            reporter: {
              id: "user1",
              name: "John Smith"
            },
            reason: "This comment contains offensive language",
            status: "pending",
            createdAt: "2023-09-14T10:30:00Z",
            contentTitle: "Advanced Content Modeling"
          },
          // ... other reports
        ]);

        setBannedWords([
          {
            id: "bw1",
            word: "badword1",
            action: "flag",
            severity: "medium",
            createdAt: "2023-08-10T09:30:00Z"
          },
          // ... other banned words
        ]);
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

  const [posts, setPosts] = useState<ForumPost[]>([
    // ... existing forum posts mock data
  ]);

  // ... existing chat messages and users mock data

  // Filter comments based on search query and tab
  const filteredComments = useMemo(() => {
    let filtered = comments;
    
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

  // Calculate total pages
  const totalCommentsPages = Math.ceil(filteredComments.length / commentsPerPage);

  const handleApproveComment = async (commentId: string) => {
    try {
      await CommentsApi.approveComment(commentId);
      
      const updatedComments = comments.map(comment =>
        comment.id === commentId ? { ...comment, status: "approved" } : comment
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
      await CommentsApi.rejectComment(commentId);
      
      const updatedComments = comments.map(comment =>
        comment.id === commentId ? { ...comment, status: "rejected" } : comment
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

  const handleBanUser = (userId: string) => {
    // In a real app, this would call an API to ban the user
    toast({
      title: "User banned",
      description: "The user has been banned and can no longer comment.",
    });
  };

  const handleResolveReport = (reportId: string) => {
    const updatedReports = reports.map(report =>
      report.id === reportId ? { ...report, status: "resolved" } : report
    );
    
    setReports(updatedReports);
    
    toast({
      title: "Report resolved",
      description: "The report has been marked as resolved.",
    });
  };

  const handleDismissReport = (reportId: string) => {
    const updatedReports = reports.map(report =>
      report.id === reportId ? { ...report, status: "dismissed" } : report
    );
    
    setReports(updatedReports);
    
    toast({
      title: "Report dismissed",
      description: "The report has been dismissed.",
    });
  };

  const handleAddBannedWord = () => {
    if (!bannedWordText.trim()) {
      toast({
        title: "Empty word",
        description: "Please enter a word to ban.",
        variant: "destructive"
      });
      return;
    }
    
    const newBannedWord: BannedWord = {
      id: `bw${bannedWords.length + 1}`,
      word: bannedWordText.trim().toLowerCase(),
      action: bannedWordAction,
      severity: bannedWordAction === "ban" ? "high" : bannedWordAction === "delete" ? "medium" : "low",
      createdAt: new Date().toISOString()
    };
    
    setBannedWords([...bannedWords, newBannedWord]);
    setBannedWordText("");
    
    toast({
      title: "Word banned",
      description: `The word "${bannedWordText}" has been added to the banned words list.`,
    });
  };

  const handleDeleteBannedWord = (wordId: string) => {
    const updatedBannedWords = bannedWords.filter(word => word.id !== wordId);
    setBannedWords(updatedBannedWords);
    
    toast({
      title: "Word removed",
      description: "The word has been removed from the banned words list.",
    });
  };

  const handleSubmitReply = async () => {
    if (!selectedComment || !replyText.trim()) return;
    
    try {
      const newComment: Partial<Comment> = {
        parentId: selectedComment.id,
        content: replyText.trim(),
        contentId: selectedComment.contentId,
        contentTitle: selectedComment.contentTitle,
        contentType: selectedComment.contentType,
        author: {
          id: "admin1", // In a real app, this would be the current user
          name: "Admin User",
          email: "admin@example.com",
          avatar: "/placeholder.svg",
          status: "active"
        }
      };
      
      // Save the comment using CommentsApi
      const savedComment = await CommentsApi.saveComment(newComment as Comment);
      
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

  // Rest of the component functions remain unchanged

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Comments & Community</h1>
      </div>
      
      <Tabs defaultValue="comments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Comments</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag size={16} />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Shield size={16} />
            <span className="hidden sm:inline">Moderation</span>
          </TabsTrigger>
          <TabsTrigger value="forum" className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Forum</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CommentsTab
              comments={paginatedComments}
              totalPages={totalCommentsPages}
              currentPage={currentCommentsPage}
              onPageChange={setCurrentCommentsPage}
              itemsPerPage={commentsPerPage}
              onItemsPerPageChange={setCommentsPerPage}
              pageSizeOptions={[5, 10, 25, 50]}
              onApprove={handleApproveComment}
              onReject={handleRejectComment}
              onReply={(comment) => {
                setSelectedComment(comment);
                setReplyText("");
              }}
              selectedComment={selectedComment}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onSubmitReply={handleSubmitReply}
              onCancelReply={() => setSelectedComment(null)}
              searchQuery={commentSearchQuery}
              onSearchQueryChange={setCommentSearchQuery}
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />
          )}
        </TabsContent>
        
        {/* Other TabsContent components remain the same */}
      </Tabs>
    </div>
  );
};

export default CommentsPage;
