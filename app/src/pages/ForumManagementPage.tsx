import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { listForums } from '@/lib/api/ForumsApi';
import CreateForumModal from '@/components/Community/CreateForumModal';

interface Forum {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  archived_at?: string;
}

const ForumManagementPage: React.FC = () => {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentWorkspace?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await listForums(currentWorkspace.id);
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
  }, [currentWorkspace?.id, toast]);

  const handleForumCreated = (newForum: Forum) => {
    setForums([newForum, ...forums]);
  };

  // Filter forums by status
  const activeForums = forums.filter(forum => !forum.deleted_at && !forum.archived_at);
  const archivedForums = forums.filter(forum => forum.archived_at && !forum.deleted_at);
  const deletedForums = forums.filter(forum => forum.deleted_at);

  const getForumStatus = (forum: Forum) => {
    if (forum.deleted_at) return 'deleted';
    if (forum.archived_at) return 'archived';
    return 'active';
  };

  const renderForumTable = (forumList: Forum[], emptyMessage: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Forum Name</TableHead>
          <TableHead>Created</TableHead>
          {forumList.some(f => f.archived_at) && <TableHead>Archived</TableHead>}
          {forumList.some(f => f.deleted_at) && <TableHead>Deleted</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {forumList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          forumList.map((forum) => {
            const status = getForumStatus(forum);
            return (
              <TableRow key={forum.id}>
                <TableCell>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate(`/community/forums/${forum.id}`)}
                      className="font-medium text-left hover:text-blue-600 hover:underline transition-colors"
                      disabled={status !== 'active'}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {forum.name}
                      </div>
                    </button>
                    {forum.description && (
                      <div className="text-sm text-muted-foreground">
                        {forum.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(forum.created_at).toLocaleDateString()}
                </TableCell>
                {forum.archived_at && (
                  <TableCell>
                    {new Date(forum.archived_at).toLocaleDateString()}
                  </TableCell>
                )}
                {forum.deleted_at && (
                  <TableCell>
                    {new Date(forum.deleted_at).toLocaleDateString()}
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <div className="flex justify-end">
              <TabsList className="grid grid-cols-3 w-fit">
                <TabsTrigger value="active" className="text-xs px-2 py-1">
                  Active
                </TabsTrigger>
                <TabsTrigger value="archived" className="text-xs px-2 py-1">
                  Archived
                </TabsTrigger>
                <TabsTrigger value="deleted" className="text-xs px-2 py-1">
                  Deleted
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="active" className="mt-6">
              {renderForumTable(
                activeForums, 
                "No active forums found. Create your first forum to get started."
              )}
            </TabsContent>
            
            <TabsContent value="archived" className="mt-6">
              {renderForumTable(
                archivedForums, 
                "No archived forums found."
              )}
            </TabsContent>
            
            <TabsContent value="deleted" className="mt-6">
              {renderForumTable(
                deletedForums, 
                "No deleted forums found."
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default ForumManagementPage;
