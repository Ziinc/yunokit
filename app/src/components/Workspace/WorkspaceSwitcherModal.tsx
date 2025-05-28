import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, Power, PowerOff, Loader2, Link2, AlertCircle } from "lucide-react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchParams } from "react-router-dom";
import {
  initiateOAuthFlow,
  exchangeCodeForToken,
  checkSupabaseConnection,
  listProjects,
} from "@/lib/supabase";
import useSWR from "swr";
import { WorkspaceRow, updateWorkspace } from "@/lib/api/WorkspaceApi";
import { checkTokenNeedsRefresh, refreshAccessToken } from "@/lib/supabase";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceSwitcherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkspaceSwitcherModal: React.FC<WorkspaceSwitcherModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [searchParams] = useSearchParams();
  const { workspaces, currentWorkspace, setCurrentWorkspace, refreshWorkspaces } = useWorkspace();
  const [isCreating, setIsCreating] = React.useState(false);
  const [linkingWorkspaceId, setLinkingWorkspaceId] = React.useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [isLinking, setIsLinking] = React.useState(false);
  const { toast } = useToast();

  const {
    data: resp,
    mutate: refreshSbConnection,
    isLoading: isCheckingConnection,
  } = useSWR("sbConnection", checkSupabaseConnection, {
    revalidateIfStale: false,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const isConnected = resp?.result;
  const { data: isTokenExpired = true } = useSWR(
    isConnected ? "valid_access_token" : null,
    checkTokenNeedsRefresh,
    {
      revalidateIfStale: false,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  console.log("isConnected", isConnected);
  console.log("isTokenExpired", isTokenExpired);
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
  console.log("projects", projects);
  
  // Filter out projects that are already linked to other workspaces
  const getAvailableProjects = (excludeWorkspaceId?: number) => {
    if (!projects) return [];
    
    const linkedProjectIds = workspaces
      .filter(w => w.id !== excludeWorkspaceId && w.project_ref)
      .map(w => w.project_ref);
    
    return projects.filter(project => !linkedProjectIds.includes(project.id));
  };

  const checkConnection = async () => {
    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      if (code) {
        console.log("code", code);
        await exchangeCodeForToken(code, state);
        await refreshSbConnection();
        return;
      }
    } catch (error) {
      console.error("Connection check error:", error);
    }
  };

  useEffect(() => {
    checkConnection();
  }, [searchParams]);

  useEffect(() => {
    if (isTokenExpired) {
      refreshAccessToken();
    }
  }, [isTokenExpired]);

  const handleWorkspaceSelect = (workspace: WorkspaceRow) => {
    if (!workspace.project_ref) {
      return;
    }
    setCurrentWorkspace(workspace);
    onOpenChange(false);
  };

  const handleLinkProject = async () => {
    if (!linkingWorkspaceId || !selectedProjectId) return;

    // Additional validation: check if project is already linked to another workspace
    const linkedProjectIds = workspaces
      .filter(w => w.id !== linkingWorkspaceId && w.project_ref)
      .map(w => w.project_ref);
    
    if (linkedProjectIds.includes(selectedProjectId)) {
      toast({
        title: "Project already linked",
        description: "This project is already linked to another workspace. Please select a different project.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLinking(true);
      await updateWorkspace(linkingWorkspaceId, { project_ref: selectedProjectId });
      await refreshWorkspaces();
      
      toast({
        title: "Project linked",
        description: "Workspace has been linked to the Supabase project",
      });
      
      setLinkingWorkspaceId(null);
      setSelectedProjectId("");
    } catch (error) {
      toast({
        title: "Failed to link project",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleCancelLink = () => {
    setLinkingWorkspaceId(null);
    setSelectedProjectId("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !currentWorkspace && !isCreating) {
      return;
    }
    onOpenChange(newOpen);
  };

  if (isCreating) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <CreateWorkspaceForm
            onSuccess={() => {
              setIsCreating(false);
              onOpenChange(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] min-h-[400px]">
        <DialogHeader>
          <DialogTitle>Your Workspaces</DialogTitle>
        </DialogHeader>
        <Alert className="mb-4">
          <AlertDescription>
            A workspace links to a Supabase project under the{" "}
            <code>supacontent</code> schema. This is where your content and
            settings will be stored.
          </AlertDescription>
        </Alert>
        {isCheckingConnection ? (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking connection...</span>
          </div>
        ) : !isConnected ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center gap-2">
              <PowerOff className="h-4 w-4" />
              <span>
                No Supabase connection found. Please connect your Supabase
                project to continue.
              </span>
            </AlertDescription>
            <div className="flex justify-center mt-4">
              <Button
                variant="default"
                onClick={() => {
                  initiateOAuthFlow();
                }}
              >
                <Power className="h-4 w-4 mr-2" />
                Connect Supabase Project
              </Button>
            </div>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-y-auto">
            {workspaces.map((workspace) => {
              const hasProject = !!workspace.project_ref;
              const isLinkingThis = linkingWorkspaceId === workspace.id;
              
              return (
                <Card
                  key={workspace.id}
                  className={cn(
                    "relative transition-colors",
                    hasProject && !isLinkingThis && "cursor-pointer hover:bg-accent/5",
                    workspace.id === currentWorkspace?.id && "border-primary",
                    !hasProject && !isLinkingThis && "border-dashed opacity-75"
                  )}
                  onClick={() => hasProject && !isLinkingThis && handleWorkspaceSelect(workspace)}
                >
                  <CardHeader className="pb-12">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {!hasProject && !isLinkingThis && (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        {workspace.id === currentWorkspace?.id && hasProject && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                    <CardDescription>{workspace.description}</CardDescription>
                    
                    {!hasProject && !isLinkingThis && (
                      <div className="mt-2">
                        <p className="text-sm text-amber-600 mb-2">
                          No project linked - workspace cannot be selected
                        </p>
                        {getAvailableProjects(workspace.id).length > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLinkingWorkspaceId(workspace.id);
                            }}
                            className="w-full"
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Link Project
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No available projects to link
                          </p>
                        )}
                      </div>
                    )}
                    
                    {isLinkingThis && (
                      <div className="mt-2 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Select a Supabase project to link:
                        </p>
                        <Select
                          value={selectedProjectId}
                          onValueChange={setSelectedProjectId}
                          disabled={getAvailableProjects(workspace.id).length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              getAvailableProjects(workspace.id).length === 0
                                ? "No available projects"
                                : "Select project..."
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableProjects(workspace.id).map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name} ({project.region})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getAvailableProjects(workspace.id).length === 0 && (
                          <p className="text-sm text-amber-600">
                            All available projects are already linked to other workspaces.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLinkProject();
                            }}
                            disabled={!selectedProjectId || isLinking || getAvailableProjects(workspace.id).length === 0}
                            className="flex-1"
                          >
                            {isLinking ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Link2 className="h-4 w-4 mr-2" />
                            )}
                            Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelLink();
                            }}
                            disabled={isLinking}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  
                  {projects &&
                    workspace.project_ref &&
                    !isLinkingThis &&
                    (() => {
                      const project = projects.find(
                        (p) => p.id === workspace.project_ref
                      );
                      const isHealthy = project?.status === "ACTIVE_HEALTHY";
                      return (
                        <div className="absolute bottom-4 right-4">
                          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                            <span
                              className={
                                "inline-block w-2 h-2 rounded-full " +
                                (isHealthy ? "bg-green-500" : "bg-red-500")
                              }
                            />
                            {project?.name || "Unknown"}{" "}
                            {!isHealthy && `(${project?.status})`}
                          </div>
                        </div>
                      );
                    })()}
                </Card>
              );
            })}
            <Card
              className="border-dashed cursor-pointer hover:bg-accent/5 w-full aspect-[16/9]"
              onClick={() => setIsCreating(true)}
            >
              <CardContent className="flex flex-row items-center gap-3 p-4 h-full">
                <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">Create New Workspace</p>
                  <p className="text-sm text-muted-foreground truncate">
                    Start a new workspace for your content
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
