import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Flag, Shield, MessageSquare, Users, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Comment, Report, BannedWord, ForumPost, ChatMessage, ChatChannel, User } from "@/types/comments";
import CommentsTab from "@/components/Comments/CommentsTab";
import ReportsTab from "@/components/Comments/ReportsTab";
import ModerationTab from "@/components/Comments/ModerationTab";
import ForumTab from "@/components/Comments/ForumTab";
import ChatTab from "@/components/Comments/ChatTab";
import UsersTab from "@/components/Comments/UsersTab";
import { formatDate } from "@/utils/formatDate";

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

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      content: "Great article! This really helped me understand the topic better.",
      status: "approved",
      createdAt: "2023-09-16T14:30:00Z",
      contentId: "123",
      contentTitle: "Getting Started with SupaContent",
      contentType: "tutorial",
      author: {
        id: "user1",
        name: "John Smith",
        email: "john@example.com",
        avatar: "/placeholder.svg",
        status: "active"
      }
    },
    {
      id: "2",
      content: "I found a typo in the third paragraph. It should be 'their' not 'there'.",
      status: "approved",
      createdAt: "2023-09-15T09:45:00Z",
      contentId: "123",
      contentTitle: "Getting Started with SupaContent",
      contentType: "tutorial",
      author: {
        id: "user2",
        name: "Jane Doe",
        email: "jane@example.com",
        avatar: "/placeholder.svg",
        status: "active"
      }
    },
    {
      id: "3",
      content: "Buy cheap watches and bags! Visit now www.spam-site.com",
      status: "spam",
      createdAt: "2023-09-14T22:10:00Z",
      contentId: "123",
      contentTitle: "Getting Started with SupaContent",
      contentType: "tutorial",
      author: {
        id: "user3",
        name: "Spammer",
        email: "spam@example.com",
        avatar: "/placeholder.svg",
        status: "banned"
      }
    },
    {
      id: "4",
      parentId: "1",
      content: "Thanks for your feedback! I'm glad you found it helpful.",
      status: "approved",
      createdAt: "2023-09-16T15:20:00Z",
      contentId: "123",
      contentTitle: "Getting Started with SupaContent",
      contentType: "tutorial",
      author: {
        id: "admin1",
        name: "Admin User",
        email: "admin@example.com",
        avatar: "/placeholder.svg",
        status: "active"
      }
    },
    {
      id: "5",
      content: "This content is inappropriate and offensive.",
      status: "flagged",
      createdAt: "2023-09-13T16:45:00Z",
      contentId: "456",
      contentTitle: "Advanced Content Modeling",
      contentType: "article",
      author: {
        id: "user4",
        name: "Flagged User",
        email: "flagged@example.com",
        avatar: "/placeholder.svg",
        status: "active"
      },
      reports: {
        count: 3,
        reasons: ["offensive", "inappropriate", "spam"]
      }
    }
  ]);

  const [reports, setReports] = useState<Report[]>([
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
    {
      id: "r2",
      type: "comment",
      targetId: "5",
      targetName: "Flagged User",
      reporter: {
        id: "user2",
        name: "Jane Doe"
      },
      reason: "Inappropriate content that violates community guidelines",
      status: "pending",
      createdAt: "2023-09-14T11:15:00Z",
      contentTitle: "Advanced Content Modeling"
    },
    {
      id: "r3",
      type: "user",
      targetId: "user4",
      targetName: "Flagged User",
      reporter: {
        id: "user3",
        name: "Spammer"
      },
      reason: "This user consistently posts inappropriate content",
      status: "pending",
      createdAt: "2023-09-14T14:20:00Z"
    },
    {
      id: "r4",
      type: "comment",
      targetId: "3",
      targetName: "Spammer",
      reporter: {
        id: "admin1",
        name: "Admin User"
      },
      reason: "Spam content with external links",
      status: "resolved",
      createdAt: "2023-09-14T16:45:00Z",
      contentTitle: "Getting Started with SupaContent"
    }
  ]);

  const [bannedWords, setBannedWords] = useState<BannedWord[]>([
    {
      id: "bw1",
      word: "badword1",
      action: "flag",
      severity: "medium",
      createdAt: "2023-08-10T09:30:00Z"
    },
    {
      id: "bw2",
      word: "badword2",
      action: "delete",
      severity: "high",
      createdAt: "2023-08-15T14:20:00Z"
    },
    {
      id: "bw3",
      word: "badword3",
      action: "ban",
      severity: "high",
      createdAt: "2023-09-01T11:45:00Z"
    }
  ]);

  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "post1",
      title: "Getting started with our community guidelines",
      content: "Welcome to our community! Here are some guidelines to follow when posting and interacting with other members...",
      status: "published",
      createdAt: "2023-09-10T11:30:00Z",
      updatedAt: "2023-09-10T11:30:00Z",
      views: 1250,
      likes: 78,
      replies: 23,
      author: {
        id: "admin1",
        name: "Admin User",
        avatar: "/placeholder.svg",
        status: "active"
      },
      tags: ["pinned", "guidelines", "welcome"],
      pinned: true
    },
    {
      id: "post2",
      title: "Upcoming features discussion thread",
      content: "Let's discuss what features you'd like to see in our upcoming releases...",
      status: "published",
      createdAt: "2023-09-12T14:20:00Z",
      updatedAt: "2023-09-14T09:15:00Z",
      views: 854,
      likes: 42,
      replies: 67,
      author: {
        id: "user1",
        name: "John Smith",
        avatar: "/placeholder.svg",
        status: "active"
      },
      tags: ["discussion", "features", "roadmap"],
      pinned: false
    },
    {
      id: "post3",
      title: "Inappropriate content - please remove",
      content: "This post contains links to inappropriate websites and offensive language...",
      status: "flagged",
      createdAt: "2023-09-15T16:45:00Z",
      updatedAt: "2023-09-15T16:45:00Z",
      views: 124,
      likes: 3,
      replies: 8,
      author: {
        id: "user4",
        name: "Flagged User",
        avatar: "/placeholder.svg",
        status: "active"
      },
      tags: ["reported", "inappropriate"],
      pinned: false
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg1",
      content: "Hello everyone! Welcome to the general chat channel.",
      status: "visible",
      createdAt: "2023-09-15T10:30:00Z",
      channelId: "channel1",
      channelName: "General",
      author: {
        id: "admin1",
        name: "Admin User",
        avatar: "/placeholder.svg",
        status: "active"
      }
    },
    {
      id: "msg2",
      content: "Thanks for having me! I'm excited to be part of this community.",
      status: "visible",
      createdAt: "2023-09-15T10:35:00Z",
      channelId: "channel1",
      channelName: "General",
      author: {
        id: "user1",
        name: "John Smith",
        avatar: "/placeholder.svg",
        status: "active"
      }
    },
    {
      id: "msg3",
      content: "Hey all! Check out my new website at suspicious-link.com for free stuff!",
      status: "flagged",
      createdAt: "2023-09-15T11:20:00Z",
      channelId: "channel1",
      channelName: "General",
      author: {
        id: "user4",
        name: "Flagged User",
        avatar: "/placeholder.svg",
        status: "active"
      }
    },
    {
      id: "msg4",
      content: "Are there any developers here who can help with a React question?",
      status: "visible",
      createdAt: "2023-09-15T14:15:00Z",
      channelId: "channel2",
      channelName: "Development",
      author: {
        id: "user2",
        name: "Jane Doe",
        avatar: "/placeholder.svg",
        status: "active"
      }
    }
  ]);

  const [channels, setChannels] = useState<ChatChannel[]>([
    {
      id: "channel1",
      name: "General",
      description: "General chat for all community members",
      status: "active",
      messageCount: 156,
      memberCount: 253,
      createdAt: "2023-08-01T09:00:00Z"
    },
    {
      id: "channel2",
      name: "Development",
      description: "Technical discussions about development",
      status: "active",
      messageCount: 89,
      memberCount: 128,
      createdAt: "2023-08-03T14:30:00Z"
    },
    {
      id: "channel3",
      name: "Moderators",
      description: "Private channel for moderators only",
      status: "private",
      messageCount: 42,
      memberCount: 8,
      createdAt: "2023-08-01T10:15:00Z"
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: "admin1",
      name: "Admin User",
      email: "admin@example.com",
      avatar: "/placeholder.svg",
      status: "active",
      role: "admin",
      createdAt: "2023-07-15T10:00:00Z",
      lastActive: "2023-09-16T15:30:00Z",
      commentsCount: 24,
      reportsCount: 0,
      postsCount: 12
    },
    {
      id: "user1",
      name: "John Smith",
      email: "john@example.com",
      avatar: "/placeholder.svg",
      status: "active",
      role: "user",
      createdAt: "2023-08-05T14:20:00Z",
      lastActive: "2023-09-16T12:45:00Z",
      commentsCount: 18,
      reportsCount: 2,
      postsCount: 5
    },
    {
      id: "user2",
      name: "Jane Doe",
      email: "jane@example.com",
      avatar: "/placeholder.svg",
      status: "active",
      role: "moderator",
      createdAt: "2023-08-10T09:15:00Z",
      lastActive: "2023-09-15T17:30:00Z",
      commentsCount: 32,
      reportsCount: 8,
      postsCount: 7
    },
    {
      id: "user3",
      name: "Spammer",
      email: "spam@example.com",
      avatar: "/placeholder.svg",
      status: "banned",
      role: "user",
      createdAt: "2023-09-01T16:40:00Z",
      lastActive: "2023-09-14T22:10:00Z",
      commentsCount: 3,
      reportsCount: 0,
      postsCount: 0
    },
    {
      id: "user4",
      name: "Flagged User",
      email: "flagged@example.com",
      avatar: "/placeholder.svg",
      status: "restricted",
      role: "user",
      createdAt: "2023-08-20T11:30:00Z",
      lastActive: "2023-09-15T13:20:00Z",
      commentsCount: 15,
      reportsCount: 5,
      postsCount: 3
    }
  ]);

  const handleApproveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(c => 
        c.id === commentId ? {...c, status: "approved"} : c
      )
    );
    
    toast({
      title: "Comment approved",
      description: "The comment has been approved and is now visible to users",
    });
  };

  const handleRejectComment = (commentId: string) => {
    setComments(prev => 
      prev.map(c => 
        c.id === commentId ? {...c, status: "deleted"} : c
      )
    );
    
    toast({
      title: "Comment rejected",
      description: "The comment has been rejected and is no longer visible",
    });
  };

  const handleBanUser = (userId: string) => {
    setComments(prev => 
      prev.map(c => 
        c.author.id === userId ? {...c, author: {...c.author, status: "banned"}} : c
      )
    );
    
    toast({
      title: "User banned",
      description: "The user has been banned from posting further comments",
    });
  };

  const handleResolveReport = (reportId: string) => {
    setReports(prev => 
      prev.map(r => 
        r.id === reportId ? {...r, status: "resolved"} : r
      )
    );
    
    toast({
      title: "Report resolved",
      description: "The report has been marked as resolved",
    });
  };

  const handleDismissReport = (reportId: string) => {
    setReports(prev => 
      prev.map(r => 
        r.id === reportId ? {...r, status: "dismissed"} : r
      )
    );
    
    toast({
      title: "Report dismissed",
      description: "The report has been dismissed as not violating guidelines",
    });
  };

  const handleAddBannedWord = () => {
    if (!bannedWordText.trim()) return;
    
    const newBannedWord: BannedWord = {
      id: `bw${bannedWords.length + 1}`,
      word: bannedWordText.trim().toLowerCase(),
      action: bannedWordAction,
      severity: bannedWordAction === "ban" ? "high" : bannedWordAction === "delete" ? "medium" : "low",
      createdAt: new Date().toISOString()
    };
    
    setBannedWords(prev => [...prev, newBannedWord]);
    setBannedWordText("");
    
    toast({
      title: "Banned word added",
      description: `"${bannedWordText}" has been added to the banned words list`,
    });
  };

  const handleDeleteBannedWord = (wordId: string) => {
    setBannedWords(prev => prev.filter(word => word.id !== wordId));
    
    toast({
      title: "Banned word removed",
      description: "The word has been removed from the banned words list",
    });
  };

  const handleSubmitReply = () => {
    if (!selectedComment || !replyText.trim()) return;
    
    const newReply: Comment = {
      id: `${comments.length + 1}`,
      content: replyText,
      status: "approved",
      parentId: selectedComment.id,
      createdAt: new Date().toISOString(),
      contentId: selectedComment.contentId,
      contentTitle: selectedComment.contentTitle,
      contentType: selectedComment.contentType,
      author: {
        id: "admin1",
        name: "Admin User",
        email: "admin@example.com",
        avatar: "/placeholder.svg",
        status: "active"
      }
    };
    
    setComments(prev => [...prev, newReply]);
    setReplyText("");
    setSelectedComment(null);
    
    toast({
      title: "Reply posted",
      description: "Your reply has been posted successfully",
    });
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    
    toast({
      title: "Post deleted",
      description: "The forum post has been permanently deleted",
    });
  };

  const handlePinPost = (postId: string, pinned: boolean) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId ? {...post, pinned} : post
      )
    );
    
    toast({
      title: pinned ? "Post pinned" : "Post unpinned",
      description: pinned ? "The post will now appear at the top of the forum" : "The post has been unpinned",
    });
  };

  const handleChangePostStatus = (postId: string, status: "published" | "draft" | "archived" | "flagged") => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId ? {...post, status} : post
      )
    );
    
    toast({
      title: "Post status updated",
      description: `The post status has been changed to ${status}`,
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(message => message.id !== messageId));
    
    toast({
      title: "Message deleted",
      description: "The chat message has been permanently deleted",
    });
  };

  const handleHideMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId ? {...message, status: "hidden"} : message
      )
    );
    
    toast({
      title: "Message hidden",
      description: "The message has been hidden from the chat",
    });
  };

  const handleChangeMessageStatus = (messageId: string, status: "visible" | "hidden" | "flagged") => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId ? {...message, status} : message
      )
    );
    
    toast({
      title: "Message status updated",
      description: `The message status has been changed to ${status}`,
    });
  };

  const handleChangeUserStatus = (userId: string, status: "active" | "banned" | "restricted") => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? {...user, status} : user
      )
    );
    
    toast({
      title: "User status updated",
      description: `The user status has been changed to ${status}`,
    });
  };

  const handleChangeUserRole = (userId: string, role: "user" | "moderator" | "admin") => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? {...user, role} : user
      )
    );
    
    toast({
      title: "User role updated",
      description: `The user role has been changed to ${role}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Community & Moderation</h1>
      </div>

      <Tabs defaultValue="comments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comments" className="flex items-center gap-1.5">
            <MessageCircle size={16} />
            <span>Comments</span>
          </TabsTrigger>
          <TabsTrigger value="forum" className="flex items-center gap-1.5">
            <FileText size={16} />
            <span>Forum Posts</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-1.5">
            <MessageSquare size={16} />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <Users size={16} />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5">
            <Flag size={16} />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-1.5">
            <Shield size={16} />
            <span>Auto-Moderation</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments" className="space-y-6">
          <CommentsTab 
            comments={comments}
            currentTab={currentTab}
            commentSearchQuery={commentSearchQuery}
            selectedComment={selectedComment}
            replyText={replyText}
            setCurrentTab={setCurrentTab}
            setCommentSearchQuery={setCommentSearchQuery}
            setSelectedComment={setSelectedComment}
            setReplyText={setReplyText}
            handleApproveComment={handleApproveComment}
            handleRejectComment={handleRejectComment}
            handleBanUser={handleBanUser}
            handleSubmitReply={handleSubmitReply}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="forum" className="space-y-6">
          <ForumTab 
            posts={posts}
            postsSearchQuery={postsSearchQuery}
            setPostsSearchQuery={setPostsSearchQuery}
            handleDeletePost={handleDeletePost}
            handlePinPost={handlePinPost}
            handleChangePostStatus={handleChangePostStatus}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="chat" className="space-y-6">
          <ChatTab 
            messages={messages}
            channels={channels}
            messageSearchQuery={messageSearchQuery}
            setMessageSearchQuery={setMessageSearchQuery}
            handleDeleteMessage={handleDeleteMessage}
            handleHideMessage={handleHideMessage}
            handleChangeMessageStatus={handleChangeMessageStatus}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UsersTab 
            users={users}
            userSearchQuery={userSearchQuery}
            setUserSearchQuery={setUserSearchQuery}
            handleChangeUserStatus={handleChangeUserStatus}
            handleChangeUserRole={handleChangeUserRole}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <ReportsTab 
            reports={reports}
            comments={comments}
            reportsSearchQuery={reportsSearchQuery}
            selectedReport={selectedReport}
            setReportsSearchQuery={setReportsSearchQuery}
            setSelectedReport={setSelectedReport}
            handleResolveReport={handleResolveReport}
            handleDismissReport={handleDismissReport}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="moderation" className="space-y-6">
          <ModerationTab 
            bannedWords={bannedWords}
            bannedWordText={bannedWordText}
            bannedWordAction={bannedWordAction}
            setBannedWordText={setBannedWordText}
            setBannedWordAction={setBannedWordAction}
            handleAddBannedWord={handleAddBannedWord}
            handleDeleteBannedWord={handleDeleteBannedWord}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommentsPage;
