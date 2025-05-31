import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { CreateWorkspaceForm } from "@/components/Workspace/CreateWorkspaceForm";
import { WorkspaceDeleteDialog } from "@/components/Workspace/WorkspaceDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { getWorkspaceLimit, deleteWorkspace, WorkspaceRow } from "@/lib/api/WorkspaceApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { checkSupabaseConnection, listProjects } from "@/lib/supabase";
import useSWR from "swr";

const SettingsWorkspacesPage: React.FC = () => {
  const { workspaces, isLoading, refreshWorkspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [workspaceLimit, setWorkspaceLimit] = useState<{ 
    currentCount: number; 
    includedWorkspaces: number; 
    additionalWorkspaces: number;
    planName: string;
    isAlphaPhase: boolean;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    workspace: WorkspaceRow | null;
    isDeleting: boolean;
  }>({
    open: false,
    workspace: null,
    isDeleting: false,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Supabase connection and projects data
  const { data: connectionResp } = useSWR("sbConnection", checkSupabaseConnection, {
    revalidateIfStale: false,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const isConnected = connectionResp?.result;

  const { data: projects } = useSWR(
    isConnected ? "projects" : null,
    listProjects,
    {
      revalidateIfStale: false,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

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
      const isCurrentWorkspace = deleteDialog.workspace.id === currentWorkspace?.id;
      
      await deleteWorkspace(deleteDialog.workspace.id);
      await refreshWorkspaces();

      // Only clear current workspace if we're deleting the currently selected one
      if (isCurrentWorkspace) {
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

  const handleSwitchWorkspace = (workspace: WorkspaceRow) => {
    setCurrentWorkspace(workspace);
    toast({
      title: "Workspace switched",
      description: `Switched to ${workspace.name}`
    });
  };

  const handleCreateSuccess = async () => {
    await refreshWorkspaces();
    setShowCreateModal(false);
    toast({
      title: "Workspace created",
      description: "Your new workspace has been created successfully"
    });
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      You have {workspaceLimit.currentCount} workspace{workspaceLimit.currentCount !== 1 ? 's' : ''} on your {workspaceLimit.planName} plan
                      {workspaceLimit.isAlphaPhase && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full cursor-help">
                                Alpha - No Cost
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>During the alpha release, all features are free.<br />No charges will be applied to your account.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </span>
                  </div>
                  
                  {workspaceLimit.additionalWorkspaces > 0 && (
                    <div className="flex items-center gap-2 ml-7">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-muted-foreground">
                        {workspaceLimit.additionalWorkspaces} workspace{workspaceLimit.additionalWorkspaces !== 1 ? 's' : ''} above your plan's {workspaceLimit.includedWorkspaces} included workspace{workspaceLimit.includedWorkspaces !== 1 ? 's' : ''}
                        {!workspaceLimit.isAlphaPhase && (
                          <span className="text-amber-600"> - You'll be billed $10/month for each additional workspace</span>
                        )}
                      </span>
                    </div>
                  )}
                  
                  {workspaceLimit.additionalWorkspaces === 0 && workspaceLimit.currentCount === workspaceLimit.includedWorkspaces && (
                    <div className="flex items-center gap-2 ml-7">
                      <span className="text-sm text-muted-foreground">
                        Additional workspaces will be billed at $10/month each
                        {workspaceLimit.isAlphaPhase && " (free during alpha phase)"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Existing Workspaces */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Your Workspaces</h3>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workspace
                  </Button>
                </div>
                {workspaces.map(workspace => {
                  const isCurrentWorkspace = workspace.id === currentWorkspace?.id;
                  const hasProject = !!workspace.project_ref;
                  
                  // Find the project details if linked
                  const project = projects?.find(p => p.id === workspace.project_ref);
                  const isHealthy = project?.status === "ACTIVE_HEALTHY";

                  return (
                    <Card key={workspace.id} className={isCurrentWorkspace ? "border-primary border-2" : ""}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-grow">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{workspace.name}</h4>
                              {isCurrentWorkspace && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  Current workspace
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {workspace.description || "No description"}
                            </p>
                            
                            {/* Project status indicator */}
                            {hasProject && project ? (
                              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                                <span
                                  className={
                                    "inline-block w-2 h-2 rounded-full " +
                                    (isHealthy ? "bg-green-500" : "bg-red-500")
                                  }
                                />
                                {project.name} {!isHealthy && `(${project.status})`}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700">
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                No project linked
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!isCurrentWorkspace && hasProject && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSwitchWorkspace(workspace)}
                            >
                              Switch to workspace
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(workspace)}
                            title="Delete workspace"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Workspace
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Workspace Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <CreateWorkspaceForm 
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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