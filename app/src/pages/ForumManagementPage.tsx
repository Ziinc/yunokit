import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listForums } from '@/lib/api/ForumsApi';
import CreateForumModal from '@/components/Community/CreateForumModal';

interface Forum {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  posts_count: number;
  members_count: number;
  created_at: string;
}

const ForumManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await listForums();
        setForums(data || []);
      } catch (error) {
        console.error("Error loading forums:", error);
        toast({
          title: "Error",
          description: "Failed to load forums. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleForumCreated = (newForum: Forum) => {
    setForums([newForum, ...forums]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Forum Management</CardTitle>
            <CardDescription>
              Create and manage community forums for discussions and topics
            </CardDescription>
          </div>
          <CreateForumModal onForumCreated={handleForumCreated} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Forums list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Forum Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No forums found. Create your first forum to get started.
                  </TableCell>
                </TableRow>
              ) : (
                forums.map((forum) => (
                  <TableRow key={forum.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{forum.name}</div>
                        {forum.description && (
                          <div className="text-sm text-muted-foreground">
                            {forum.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={forum.status === "active" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {forum.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{forum.posts_count || 0}</TableCell>
                    <TableCell>{forum.members_count || 0}</TableCell>
                    <TableCell>
                      {new Date(forum.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ForumManagementPage;
