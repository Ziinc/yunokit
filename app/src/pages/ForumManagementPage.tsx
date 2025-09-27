import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectionActionsBar, SelectionAction } from "@/components/ui/SelectionActionsBar";
import { Loader2, MessageSquare, Archive, Trash2, ArchiveRestore, Undo2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { listForums, archiveForum, deleteForum, unarchiveForum, restoreForum, permanentDeleteForum } from '@/lib/api/ForumsApi';
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
  const [selectedForums, setSelectedForums] = useState<Set<number>>(new Set());
  const [currentTab, setCurrentTab] = useState('active');
  const [highlightedForumId, setHighlightedForumId] = useState<number | null>(null);

  // Clear selection when tab changes
  useEffect(() => {
    setSelectedForums(new Set());
  }, [currentTab]);

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
    setCurrentTab('active');
    setHighlightedForumId(newForum.id);
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedForumId(null);
    }, 3000);
  };

  const handleSelectForum = (forumId: number, checked: boolean) => {
    const newSelected = new Set(selectedForums);
    if (checked) {
      newSelected.add(forumId);
    } else {
      newSelected.delete(forumId);
    }
    setSelectedForums(newSelected);
  };

  const handleSelectAll = (forumList: Forum[], checked: boolean) => {
    const newSelected = new Set(selectedForums);
    if (checked) {
      forumList.forEach(forum => newSelected.add(forum.id));
    } else {
      forumList.forEach(forum => newSelected.delete(forum.id));
    }
    setSelectedForums(newSelected);
  };

  const handleBulkAction = async (action: 'archive' | 'delete' | 'unarchive' | 'restore' | 'permanent-delete') => {
    if (!currentWorkspace?.id || selectedForums.size === 0) return;

    try {
      const selectedIds = Array.from(selectedForums);

      const promises = selectedIds.map(id => {
        switch (action) {
          case 'archive':
            return archiveForum(id, currentWorkspace.id);
          case 'delete':
            return deleteForum(id, currentWorkspace.id);
          case 'unarchive':
            return unarchiveForum(id, currentWorkspace.id);
          case 'restore':
            return restoreForum(id, currentWorkspace.id);
          case 'permanent-delete':
            return permanentDeleteForum(id, currentWorkspace.id);
        }
      });

      await Promise.all(promises);

      // Refresh forums list
      const { data } = await listForums(currentWorkspace.id);
      setForums(data || []);
      setSelectedForums(new Set());

      const actionText = action === 'permanent-delete' ? 'permanently deleted' : `${action}d`;
      toast({
        title: "Success",
        description: `${selectedIds.length} forum(s) ${actionText} successfully.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing forums:`, error);
      const actionText = action === 'permanent-delete' ? 'permanently delete' : action;
      toast({
        title: "Error",
        description: `Failed to ${actionText} forums. Please try again.`,
        variant: "destructive"
      });
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getSelectionActions = (): SelectionAction[] => {
    const actions: SelectionAction[] = [];

    switch (currentTab) {
      case 'active':
        actions.push(
          {
            label: "Archive",
            icon: <Archive className="h-4 w-4" />,
            onClick: () => handleBulkAction('archive'),
            variant: "outline"
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleBulkAction('delete'),
            variant: "destructive"
          }
        );
        break;
      case 'archived':
        actions.push(
          {
            label: "Unarchive",
            icon: <ArchiveRestore className="h-4 w-4" />,
            onClick: () => handleBulkAction('unarchive'),
            variant: "outline"
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleBulkAction('delete'),
            variant: "destructive"
          }
        );
        break;
      case 'deleted':
        actions.push(
          {
            label: "Restore",
            icon: <Undo2 className="h-4 w-4" />,
            onClick: () => handleBulkAction('restore'),
            variant: "outline"
          },
          {
            label: "Permanent Delete",
            icon: <X className="h-4 w-4" />,
            onClick: () => handleBulkAction('permanent-delete'),
            variant: "destructive"
          }
        );
        break;
    }

    return actions;
  };

  const renderForumTable = (forumList: Forum[], emptyMessage: string) => {
    const selectedInList = forumList.filter(forum => selectedForums.has(forum.id));
    const allSelected = forumList.length > 0 && selectedInList.length === forumList.length;
    const someSelected = selectedInList.length > 0 && selectedInList.length < forumList.length;

    return (
      <>
        {selectedForums.size > 0 && (
          <SelectionActionsBar
            selectedCount={selectedForums.size}
            actions={getSelectionActions()}
          />
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el && 'indeterminate' in el) {
                      (el as HTMLInputElement).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={(checked) => handleSelectAll(forumList, !!checked)}
                />
              </TableHead>
                             <TableHead>Name</TableHead>
               <TableHead>Created</TableHead>
              {forumList.some(f => f.archived_at) && <TableHead>Archived</TableHead>}
              {forumList.some(f => f.deleted_at) && <TableHead>Deleted</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {forumList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              forumList.map((forum) => {
                const status = getForumStatus(forum);
                const isSelected = selectedForums.has(forum.id);
                const isHighlighted = highlightedForumId === forum.id;
                
                return (
                  <TableRow 
                    key={forum.id}
                    className={isHighlighted ? "forum-highlight" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectForum(forum.id, !!checked)}
                      />
                    </TableCell>
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
                       {formatDate(forum.created_at)}
                     </TableCell>
                     {forum.archived_at && (
                       <TableCell>
                         {formatDate(forum.archived_at)}
                       </TableCell>
                     )}
                     {forum.deleted_at && (
                       <TableCell>
                         {formatDate(forum.deleted_at)}
                       </TableCell>
                     )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </>
    );
  };

  return (
    <>
      <style>{`
        @keyframes highlight-fade {
          0% { 
            background-color: rgb(240 253 244); 
            border-color: rgb(187 247 208);
            box-shadow: 0 0 0 2px rgb(187 247 208 / 0.3);
          }
          70% { 
            background-color: rgb(240 253 244); 
            border-color: rgb(187 247 208);
            box-shadow: 0 0 0 2px rgb(187 247 208 / 0.3);
          }
          100% { 
            background-color: transparent; 
            border-color: transparent;
            box-shadow: none;
          }
        }
        
        .forum-highlight {
          animation: highlight-fade 3s ease-out forwards;
        }
      `}</style>
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
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="flex justify-start">
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
    </>
  );
};

export default ForumManagementPage;
