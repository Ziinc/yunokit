import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageCircle,
  Check,
  X,
  Ban,
  Search,
  Flag,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { Comment } from "@/types/comments";

type ExtendedComment = Comment & {
  text?: string;
  contentItemId?: string;
};

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
  onBanUser?: (userId: string) => void;
  onFlagComment?: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onBulkAction?: (action: string, commentIds: string[]) => void;
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
  onBanUser,
  onFlagComment,
  onDeleteComment,
  onBulkAction,
}) => {
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");

  // Filter comments based on tab and search query
  const filteredComments = comments.filter(comment => {
    const extended = comment as ExtendedComment;
    const commentText = comment.content || extended.text || '';
    
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComments(filteredComments.map(comment => comment.id));
    } else {
      setSelectedComments([]);
    }
  };

  const handleSelectComment = (commentId: string, checked: boolean) => {
    if (checked) {
      setSelectedComments([...selectedComments, commentId]);
    } else {
      setSelectedComments(selectedComments.filter(id => id !== commentId));
    }
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedComments.length > 0 && onBulkAction) {
      onBulkAction(bulkAction, selectedComments);
      setSelectedComments([]);
      setBulkAction("");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Manage and moderate user comments across all content</CardDescription>
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

        {/* Bulk Actions */}
        {selectedComments.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md flex items-center gap-3">
            <span className="text-sm font-medium">{selectedComments.length} comments selected</span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="flag">Flag</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleBulkAction} disabled={!bulkAction} size="sm">
              Apply
            </Button>
            <Button onClick={() => setSelectedComments([])} variant="outline" size="sm">
              Clear
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No comments found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((comment) => (
                <TableRow key={comment.id} className={comment.parentId ? "bg-muted/30" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedComments.includes(comment.id)}
                      onCheckedChange={(checked) => handleSelectComment(comment.id, checked as boolean)}
                    />
                  </TableCell>
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
                      <p className="line-clamp-2">{comment.content || (comment as ExtendedComment).text}</p>
                      {comment.reports && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                          <span>Reported {comment.reports.count} times</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="font-medium truncate">{comment.contentTitle || (comment as ExtendedComment).contentItemId}</div>
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
                          title="Approve comment"
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
                          title="Reject comment"
                        >
                          <X size={16} className="text-destructive" />
                        </Button>
                      )}

                      {onFlagComment && comment.status !== "flagged" && (
                        <Button 
                          onClick={() => onFlagComment(comment.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          title="Flag comment"
                        >
                          <Flag size={16} className="text-yellow-500" />
                        </Button>
                      )}

                      {onDeleteComment && (
                        <Button 
                          onClick={() => onDeleteComment(comment.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          title="Delete comment"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onReply(comment)}
                            title="Reply to comment"
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
                            <p className="italic text-sm">{comment.content || (comment as ExtendedComment).text}</p>
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
                      
                      {onBanUser && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              title="Ban user"
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
                                onClick={() => onBanUser(comment.author.id)}
                              >
                                Ban User
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
