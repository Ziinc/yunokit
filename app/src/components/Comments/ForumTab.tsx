
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, MessageCircle, PinIcon, ThumbsUp, Trash } from "lucide-react";
import { ForumPost } from "@/types/comments";
import { ModerationSearchBar } from "@/components/ui/moderation-search-bar";
import { StatusBadge } from "@/components/ui/status-badge";


interface ForumTabProps {
  posts: ForumPost[];
  postsSearchQuery: string;
  setPostsSearchQuery: (query: string) => void;
  handleDeletePost: (postId: string) => void;
  handlePinPost: (postId: string, pinned: boolean) => void;
  handleChangePostStatus: (postId: string, status: "published" | "draft" | "archived" | "flagged") => void;
  formatDate: (dateString: string) => string;
}

const ForumTab = ({
  posts,
  postsSearchQuery,
  setPostsSearchQuery,
  handleDeletePost,
  handlePinPost,
  handleChangePostStatus,
  formatDate
}: ForumTabProps) => {
  const [currentPostTab, setCurrentPostTab] = useState<string>("all");
  
  // Filter posts based on search query and current tab
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(postsSearchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(postsSearchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(postsSearchQuery.toLowerCase());
      
    if (currentPostTab === "all") return matchesSearch;
    if (currentPostTab === "published") return matchesSearch && post.status === "published";
    if (currentPostTab === "flagged") return matchesSearch && post.status === "flagged";
    if (currentPostTab === "archived") return matchesSearch && post.status === "archived";
    if (currentPostTab === "pinned") return matchesSearch && post.pinned;
    return matchesSearch;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Forum Posts</CardTitle>
          <CardDescription>
            Manage forum posts, moderate content, and organize discussions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModerationSearchBar
            searchQuery={postsSearchQuery}
            onSearchChange={setPostsSearchQuery}
            searchPlaceholder="Search posts..."
            currentFilter={currentPostTab}
            onFilterChange={setCurrentPostTab}
            filterPlaceholder="Filter status"
            filterOptions={[
              { value: "all", label: "All Posts" },
              { value: "published", label: "Published" },
              { value: "flagged", label: "Flagged" },
              { value: "archived", label: "Archived" },
              { value: "pinned", label: "Pinned" }
            ]}
            additionalActions={<Button variant="outline">New Post</Button>}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No posts found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {post.pinned && <PinIcon size={14} className="text-warning mt-1" />}
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {post.content}
                          </div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {post.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs font-normal">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                          <img 
                            src={post.author.avatar} 
                            alt={post.author.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <span className="text-sm">{post.author.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-muted-foreground text-xs">
                        <div className="flex items-center">
                          <Eye size={12} className="mr-1" />
                          {post.views}
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp size={12} className="mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle size={12} className="mr-1" />
                          {post.replies}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(post.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          onClick={() => handlePinPost(post.id, !post.pinned)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title={post.pinned ? "Unpin post" : "Pin post"}
                        >
                          <PinIcon size={16} className={post.pinned ? "text-warning" : ""} />
                        </Button>
                        <Select
                          value={post.status}
                          onValueChange={(value: "published" | "draft" | "archived" | "flagged") => 
                            handleChangePostStatus(post.id, value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archive</SelectItem>
                            <SelectItem value="flagged">Flag</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => handleDeletePost(post.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default ForumTab;
