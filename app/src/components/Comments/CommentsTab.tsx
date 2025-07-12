import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Check,
  X,
  Ban,
  Search,
  Mail
} from "lucide-react";
import { Comment } from "@/types/comments";

interface CommentsTabProps {
  comments: Comment[];
  onApprove: (commentId: string) => void;
  onReject: (commentId: string) => void;
  onReply: (comment: Comment) => void;
  selectedComment: Comment | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (size: number) => void;
  pageSizeOptions: number[];
}

const CommentsTab: React.FC<CommentsTabProps> = ({
  comments,
  onApprove,
  onReject,
  onReply,
  selectedComment,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  onCancelReply,
  searchQuery,
  onSearchQueryChange,
  currentTab,
  onTabChange,
  currentPage,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions
}) => {
  // Filter comments based on tab and search query
  const filteredComments = comments.filter(comment => {
    // Handle both types of comment implementations (content or text property)
    const commentText = comment.content || (comment as any).text || '';
    
    const matchesTab = 
      currentTab === "all" || 
      currentTab === comment.status || 
      (currentTab === "replies" && comment.parentId);
      
    const matchesSearch = 
      commentText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comment.contentTitle && comment.contentTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesTab && matchesSearch;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Manage user comments across all content</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search comments..." 
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-9 w-[240px]"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Mail size={16} />
              <span>Notify All</span>
            </Button>
          </div>
        </div>
        
        <TabsList className="mt-4 w-full justify-start">
          <TabsTrigger 
            value="all" 
            onClick={() => onTabChange("all")}
            className={currentTab === "all" ? "bg-primary text-primary-foreground" : ""}
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            onClick={() => onTabChange("pending")}
            className={currentTab === "pending" ? "bg-primary text-primary-foreground" : ""}
          >
            Pending
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            onClick={() => onTabChange("approved")}
            className={currentTab === "approved" ? "bg-primary text-primary-foreground" : ""}
          >
            Approved
          </TabsTrigger>
          <TabsTrigger 
            value="flagged" 
            onClick={() => onTabChange("flagged")}
            className={currentTab === "flagged" ? "bg-primary text-primary-foreground" : ""}
          >
            Flagged
          </TabsTrigger>
          <TabsTrigger 
            value="spam" 
            onClick={() => onTabChange("spam")}
            className={currentTab === "spam" ? "bg-primary text-primary-foreground" : ""}
          >
            Spam
          </TabsTrigger>
          <TabsTrigger 
            value="replies" 
            onClick={() => onTabChange("replies")}
            className={currentTab === "replies" ? "bg-primary text-primary-foreground" : ""}
          >
            Replies
          </TabsTrigger>
        </TabsList>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No comments found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((comment) => (
                <TableRow key={comment.id} className={comment.parentId ? "bg-muted/30" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img 
                        src={comment.author.avatar || '/placeholder.svg'} 
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {comment.author.name}
                          {comment.author.status === "banned" && (
                            <Badge variant="destructive" className="text-xs">Banned</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{comment.author.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px]">
                      {comment.parentId && (
                        <Badge variant="outline" className="mb-1">Reply</Badge>
                      )}
                      <p className="line-clamp-2">{comment.content || (comment as any).text}</p>
                      {comment.reports && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                          <span>Reported {comment.reports.count} times</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="font-medium truncate">{comment.contentTitle || (comment as any).contentItemId}</div>
                      <div className="text-xs text-muted-foreground capitalize">{comment.contentType || 'article'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        comment.status === "approved" ? "default" : 
                        comment.status === "pending" ? "secondary" : 
                        comment.status === "flagged" ? "destructive" : 
                        comment.status === "spam" ? "outline" : 
                        "outline"
                      }
                      className="capitalize"
                    >
                      {comment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {comment.status !== "approved" && (
                        <Button 
                          onClick={() => onApprove(comment.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Check size={16} className="text-green-500" />
                        </Button>
                      )}
                      
                      {comment.status !== "deleted" && (
                        <Button 
                          onClick={() => onReject(comment.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <X size={16} className="text-destructive" />
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onReply(comment)}
                          >
                            <MessageCircle size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Reply to Comment</DialogTitle>
                            <DialogDescription>
                              You are replying to a comment by {comment.author.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="bg-muted/50 p-3 rounded-md mb-4">
                            <p className="italic text-sm">{comment.content || (comment as any).text}</p>
                          </div>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <textarea
                                className="h-24 p-2 border rounded-md resize-none w-full"
                                placeholder="Write your reply..."
                                value={selectedComment?.id === comment.id ? replyText : ''}
                                onChange={(e) => onReplyTextChange(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={onCancelReply}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={onSubmitReply}
                              disabled={!replyText.trim()}
                            >
                              Post Reply
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Ban size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ban User</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to ban {comment.author.name}? This will prevent them from posting any more comments.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={onCancelReply}>
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => {/* Handle ban user */}}
                            >
                              Ban User
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CommentsTab;
