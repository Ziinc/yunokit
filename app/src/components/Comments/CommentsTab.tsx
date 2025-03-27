
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
  currentTab: string;
  commentSearchQuery: string;
  selectedComment: Comment | null;
  replyText: string;
  setCurrentTab: (tab: string) => void;
  setCommentSearchQuery: (query: string) => void;
  setSelectedComment: (comment: Comment | null) => void;
  setReplyText: (text: string) => void;
  handleApproveComment: (commentId: string) => void;
  handleRejectComment: (commentId: string) => void;
  handleBanUser: (userId: string) => void;
  handleSubmitReply: () => void;
  formatDate: (dateString: string) => string;
}

const CommentsTab: React.FC<CommentsTabProps> = ({
  comments,
  currentTab,
  commentSearchQuery,
  selectedComment,
  replyText,
  setCurrentTab,
  setCommentSearchQuery,
  setSelectedComment,
  setReplyText,
  handleApproveComment,
  handleRejectComment,
  handleBanUser,
  handleSubmitReply,
  formatDate
}) => {
  // Filter comments based on tab and search query
  const filteredComments = comments.filter(comment => {
    const matchesTab = 
      currentTab === "all" || 
      currentTab === comment.status || 
      (currentTab === "replies" && comment.parentId);
      
    const matchesSearch = 
      comment.content.toLowerCase().includes(commentSearchQuery.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(commentSearchQuery.toLowerCase()) ||
      comment.contentTitle.toLowerCase().includes(commentSearchQuery.toLowerCase());
      
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
                value={commentSearchQuery}
                onChange={(e) => setCommentSearchQuery(e.target.value)}
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
            onClick={() => setCurrentTab("all")}
            className={currentTab === "all" ? "bg-primary text-primary-foreground" : ""}
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            onClick={() => setCurrentTab("pending")}
            className={currentTab === "pending" ? "bg-primary text-primary-foreground" : ""}
          >
            Pending
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            onClick={() => setCurrentTab("approved")}
            className={currentTab === "approved" ? "bg-primary text-primary-foreground" : ""}
          >
            Approved
          </TabsTrigger>
          <TabsTrigger 
            value="flagged" 
            onClick={() => setCurrentTab("flagged")}
            className={currentTab === "flagged" ? "bg-primary text-primary-foreground" : ""}
          >
            Flagged
          </TabsTrigger>
          <TabsTrigger 
            value="spam" 
            onClick={() => setCurrentTab("spam")}
            className={currentTab === "spam" ? "bg-primary text-primary-foreground" : ""}
          >
            Spam
          </TabsTrigger>
          <TabsTrigger 
            value="replies" 
            onClick={() => setCurrentTab("replies")}
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
                        src={comment.author.avatar} 
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
                      <p className="line-clamp-2">{comment.content}</p>
                      {comment.reports && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                          <span>Reported {comment.reports.count} times</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="font-medium truncate">{comment.contentTitle}</div>
                      <div className="text-xs text-muted-foreground capitalize">{comment.contentType}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(comment.createdAt)}
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
                          onClick={() => handleApproveComment(comment.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Check size={16} className="text-green-500" />
                        </Button>
                      )}
                      
                      {comment.status !== "deleted" && (
                        <Button 
                          onClick={() => handleRejectComment(comment.id)}
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
                            onClick={() => setSelectedComment(comment)}
                          >
                            <MessageCircle size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Reply to Comment</DialogTitle>
                            <DialogDescription>
                              Post a reply to this comment as an admin
                            </DialogDescription>
                          </DialogHeader>
                          <div className="border rounded-md p-3 my-3 bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                              <img 
                                src={selectedComment?.author.avatar} 
                                alt={selectedComment?.author.name}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="font-medium">{selectedComment?.author.name}</span>
                            </div>
                            <p className="text-sm">{selectedComment?.content}</p>
                          </div>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply here..."
                            className="h-24 w-full p-2 border rounded-md"
                          />
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedComment(null)}>Cancel</Button>
                            <Button onClick={handleSubmitReply} disabled={!replyText.trim()}>Post Reply</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {comment.author.status !== "banned" && (
                        <Button 
                          onClick={() => handleBanUser(comment.author.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Ban size={16} className="text-destructive" />
                        </Button>
                      )}
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
