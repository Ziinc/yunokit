import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Star, StarOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { CreateWorkspaceForm } from "@/components/Workspace/CreateWorkspaceForm";
import { WorkspaceDeleteDialog } from "@/components/Workspace/WorkspaceDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { getWorkspaceLimit, deleteWorkspace, WorkspaceRow } from "@/lib/api/WorkspaceApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const SettingsWorkspacesPage: React.FC = () => {
  const { workspaces, isLoading, refreshWorkspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [workspaceLimit, setWorkspaceLimit] = useState<{ currentCount: number; maxWorkspaces: number; canCreate: boolean } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    workspace: WorkspaceRow | null;
    isDeleting: boolean;
  }>({
    open: false,
    workspace: null,
    isDeleting: false,
  });

  useEffect(() => {
    const fetchWorkspaceLimit = async () => {
      try {
        const limit = await getWorkspaceLimit();
        setWorkspaceLimit(limit);
      } catch (error) {
        console.error("Failed to fetch workspace limit:", error);
      }
    };
    fetchWorkspaceLimit();
  }, []);

  const handleDeleteWorkspace = async (workspaceId: number) => {
    try {
      await deleteWorkspace(workspaceId);
      await refreshWorkspaces();

      toast({
        title: "Workspace deleted",
        description: "The workspace has been deleted successfully"
      });
    } catch (error) {
      console.error("Delete workspace error:", error);
      toast({
        title: "Failed to delete workspace",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (workspace: WorkspaceRow) => {
    setDeleteDialog({
      open: true,
      workspace,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.workspace) return;

    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteWorkspace(deleteDialog.workspace.id);
      await refreshWorkspaces();

      // If deleting current workspace, clear it
      if (deleteDialog.workspace.id === currentWorkspace?.id) {
        setCurrentWorkspace(null);
      }

      toast({
        title: "Workspace deleted",
        description: "The workspace has been deleted successfully"
      });

      setDeleteDialog({
        open: false,
        workspace: null,
        isDeleting: false,
      });
    } catch (error) {
      console.error("Delete workspace error:", error);
      toast({
        title: "Failed to delete workspace",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
      
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleSetDefaultWorkspace = async (workspace: typeof workspaces[0]) => {
    try {
      setCurrentWorkspace(workspace);
      toast({
        title: "Default workspace updated",
        description: `${workspace.name} is now your default workspace`
      });
    } catch (error) {
      console.error("Set default workspace error:", error);
      toast({
        title: "Failed to set default workspace",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <TabsContent value="workspaces" className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Workspaces</CardTitle>
          <CardDescription>
            Manage your workspaces and their settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Workspace Limit Status */}
              {workspaceLimit && (
                <div className="flex items-center gap-2">
                  {workspaceLimit.canCreate ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        You can create {workspaceLimit.maxWorkspaces - workspaceLimit.currentCount} more workspace{workspaceLimit.maxWorkspaces - workspaceLimit.currentCount !== 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        You've reached your workspace limit ({workspaceLimit.currentCount}/{workspaceLimit.maxWorkspaces})
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to="/settings/billing">
                          Add Workspace (+$10/mo)
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Existing Workspaces */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Workspaces</h3>
                {workspaces.map(workspace => (
                  <Card key={workspace.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-grow">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefaultWorkspace(workspace)}
                          title={workspace.id === currentWorkspace?.id ? "Current default workspace" : "Set as default workspace"}
                        >
                          {workspace.id === currentWorkspace?.id ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <div>
                          <h4 className="font-medium">{workspace.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {workspace.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(workspace)}
                        disabled={workspace.id === currentWorkspace?.id}
                        title={workspace.id === currentWorkspace?.id ? "Cannot delete default workspace" : "Delete workspace"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Create New Workspace */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Create New Workspace</h3>
                <CreateWorkspaceForm onSuccess={refreshWorkspaces} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {deleteDialog.open && (
        <WorkspaceDeleteDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
          workspace={deleteDialog.workspace}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteDialog.isDeleting}
        />
      )}
    </TabsContent>
  );
};

export default SettingsWorkspacesPage; 