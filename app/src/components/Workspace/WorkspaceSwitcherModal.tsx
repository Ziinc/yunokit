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
import { Plus, Check, Power, PowerOff } from "lucide-react";
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
import { WorkspaceRow } from "@/lib/api/WorkspaceApi";
import { checkTokenNeedsRefresh, refreshAccessToken } from "@/lib/supabase";
interface WorkspaceSwitcherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkspaceSwitcherModal: React.FC<WorkspaceSwitcherModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [searchParams] = useSearchParams();
  const { workspaces, currentWorkspace, setCurrentWorkspace } =
    useWorkspace();
  const [isCreating, setIsCreating] = React.useState(false);

  const {
    data: isConnected,
    mutate: refreshSbConnection,
    isLoading: isCheckingConnection,
  } = useSWR("sbConnection", checkSupabaseConnection, {
    revalidateIfStale: false,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    data: isTokenExpired = true,
  } = useSWR(isConnected ? "valid_access_token" : null, checkTokenNeedsRefresh, {
    revalidateIfStale: false,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });


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
    setCurrentWorkspace(workspace);
    onOpenChange(false);
  };

  if (isCreating) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent/5 relative",
                  workspace.id === currentWorkspace?.id && "border-primary"
                )}
                onClick={() => handleWorkspaceSelect(workspace)}
              >
                <CardHeader className="pb-12">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    {workspace.id === currentWorkspace?.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardDescription>{workspace.description}</CardDescription>
                </CardHeader>
                {projects && workspace.project_ref && (
                  (() => {
                    const project = projects.find((p) => p.id === workspace.project_ref);
                    const isHealthy = project?.status === 'ACTIVE_HEALTHY';
                    return (
                      <div className="absolute bottom-4 right-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                          <span
                            className={
                              "inline-block w-2 h-2 rounded-full " +
                              (isHealthy ? "bg-green-500" : "bg-red-500")
                            }
                          />
                          {project?.name || 'Unknown'} {!isHealthy && `(${project?.status})`}
                        </div>
                      </div>
                    );
                  })()
                )}
              </Card>
            ))}
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
