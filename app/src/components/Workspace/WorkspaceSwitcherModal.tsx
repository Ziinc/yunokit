import React, { useEffect } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Check,
  Power,
  PowerOff,
  Loader2,
  Link2,
  AlertCircle,
  X,
} from "lucide-react";
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
  checkApiKey,
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

// Custom DialogContent that conditionally shows close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

export const WorkspaceSwitcherModal: React.FC<WorkspaceSwitcherModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isExchangingCode, setIsExchangingCode] = React.useState(false);
  const [searchParams] = useSearchParams();
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    refreshWorkspaces,
  } = useWorkspace();
  const [isCreating, setIsCreating] = React.useState(false);
  const [linkingWorkspaceId, setLinkingWorkspaceId] = React.useState<
    number | null
  >(null);
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
  const { data: isTokenExpired, isLoading: isCheckingTokenExpired } = useSWR(
    isConnected ? "valid_access_token" : null,
    checkTokenNeedsRefresh,
    {
      revalidateIfStale: false,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

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

  // Filter out projects that are already linked to other workspaces
  const getAvailableProjects = (excludeWorkspaceId?: number) => {
    if (!projects) return [];

    const linkedProjectIds = workspaces
      .filter((w) => w.id !== excludeWorkspaceId && w.project_ref)
      .map((w) => w.project_ref);

    return projects.filter((project) => !linkedProjectIds.includes(project.id));
  };

  const checkConnection = async () => {
    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      if (code) {
        setIsExchangingCode(true);
        await exchangeCodeForToken(code, state);
        setIsExchangingCode(false);
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
    if (isTokenExpired === true && isConnected) {
      refreshAccessToken();
    }
  }, [isTokenExpired]);

  const handleWorkspaceSelect = (workspace: WorkspaceRow) => {
    if (!workspace.project_ref) {
      return;
    }
    setCurrentWorkspace(workspace);
    checkApiKey(workspace.id);
    onOpenChange(false);
  };

  const handleLinkProject = async () => {
    if (!linkingWorkspaceId || !selectedProjectId) return;

    // Additional validation: check if project is already linked to another workspace
    const linkedProjectIds = workspaces
      .filter((w) => w.id !== linkingWorkspaceId && w.project_ref)
      .map((w) => w.project_ref);

    if (linkedProjectIds.includes(selectedProjectId)) {
      toast({
        title: "Project already linked",
        description:
          "This project is already linked to another workspace. Please select a different project.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLinking(true);
      await updateWorkspace(linkingWorkspaceId, {
        project_ref: selectedProjectId,
      });
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
        description:
          error instanceof Error ? error.message : "Please try again later",
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
    // When disconnected, always allow the modal to open to show connection prompt
    // When connected, only allow closing if user has a current workspace or is creating one
    if (!newOpen && isConnected && !currentWorkspace && !isCreating) {
      return;
    }
    onOpenChange(newOpen);
  };

  // Determine if close button should be shown
  const shouldShowCloseButton = !isConnected || !!currentWorkspace || isCreating;

  if (isCreating) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <CustomDialogContent showCloseButton={shouldShowCloseButton}>
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
        </CustomDialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <CustomDialogContent className="max-w-3xl max-h-[90vh] min-h-[400px]" showCloseButton={shouldShowCloseButton}>
        <DialogHeader>
          <DialogTitle>Your Workspaces</DialogTitle>
        </DialogHeader>
        {/* Only show workspace info when connected */}
        {isConnected && (
          <Alert className="mb-4">
            <AlertDescription>
              A workspace links to a Supabase project under the{" "}
              <code>yunoacode</code> schema. This is where your content and
              settings will be stored.
            </AlertDescription>
          </Alert>
        )}
        {isCheckingConnection || isCheckingTokenExpired || isExchangingCode ? (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking connection...</span>
          </div>
        ) : isConnected === false ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex items-center gap-2">
                <PowerOff className="h-4 w-4" />
                <span>
                  No Supabase connection found. Please connect your Supabase
                  project to continue.
                </span>
              </AlertDescription>
            </Alert>
            <Button
              variant="default"
              onClick={() => {
                initiateOAuthFlow();
              }}
              className="min-w-[200px]"
            >
              <Power className="h-4 w-4 mr-2" />
              Connect Supabase Project
            </Button>
          </div>
        ) : (
          <div className="flex flex-row gap-4 flex-wrap mt-4 overflow-y-auto">
            {workspaces.map((workspace) => {
              const hasProject = !!workspace.project_ref;
              const isLinkingThis = linkingWorkspaceId === workspace.id;

              return (
                <Card
                  key={workspace.id}
                  className={cn(
                    "relative transition-colors w-[calc(50%-10px)]",
                    hasProject &&
                      !isLinkingThis &&
                      "cursor-pointer hover:bg-accent/5",
                    workspace.id === currentWorkspace?.id && "border-primary",
                    !hasProject && !isLinkingThis && "border-dashed opacity-75"
                  )}
                  onClick={() =>
                    hasProject &&
                    !isLinkingThis &&
                    handleWorkspaceSelect(workspace)
                  }
                >
                  <CardHeader className="pb-12">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {workspace.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {!hasProject && !isLinkingThis && (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        {workspace.id === currentWorkspace?.id &&
                          hasProject && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                      </div>
                    </div>
                    <CardDescription>
                      {workspace.description ? (
                        workspace.description
                      ) : (
                        <span className="italic">No description</span>
                      )}
                    </CardDescription>

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
                          disabled={
                            getAvailableProjects(workspace.id).length === 0
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                getAvailableProjects(workspace.id).length === 0
                                  ? "No available projects"
                                  : "Select project..."
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableProjects(workspace.id).map(
                              (project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name} ({project.region})
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        {getAvailableProjects(workspace.id).length === 0 && (
                          <p className="text-sm text-amber-600">
                            All available projects are already linked to other
                            workspaces.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLinkProject();
                            }}
                            disabled={
                              !selectedProjectId ||
                              isLinking ||
                              getAvailableProjects(workspace.id).length === 0
                            }
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
              className="w-[calc(50%-10px)] border-dashed cursor-pointer hover:bg-accent/5"
              onClick={() => setIsCreating(true)}
            >
              <CardHeader className="pb-12">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    Create New Workspace
                  </CardTitle>
                </div>
                <CardDescription>
                  Start a new workspace for your content
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </CustomDialogContent>
    </Dialog>
  );
};
