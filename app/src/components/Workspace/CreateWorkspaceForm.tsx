import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { createWorkspace } from "@/lib/api/WorkspaceApi";
import { listProjects } from "@/lib/supabase";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import useSWR from "swr";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface CreateWorkspaceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateWorkspaceForm: React.FC<CreateWorkspaceFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { refreshWorkspaces, setCurrentWorkspace, workspaces } = useWorkspace();
  const { data: projects = [], isLoading: isLoadingProjects } = useSWR(
    "projects",
    listProjects,
    {
      revalidateIfStale: false,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Filter out projects that are already linked to other workspaces
  const availableProjects = React.useMemo(() => {
    if (!projects) return [];
    
    const linkedProjectIds = workspaces
      .filter(w => w.project_ref)
      .map(w => w.project_ref);
    
    return projects.filter(project => !linkedProjectIds.includes(project.id));
  }, [projects, workspaces]);

  // Auto-select first available project when projects load
  React.useEffect(() => {
    if (availableProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(availableProjects[0].id);
    }
  }, [availableProjects, selectedProjectId]);

  const selectedProject = availableProjects.find(p => p.id === selectedProjectId);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newWorkspaceName.trim()) {
      toast({
        title: "Workspace name required",
        description: "Please enter a name for your workspace",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProjectId) {
      toast({
        title: "Project selection required",
        description: "Please select a Supabase project to link to this workspace",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      const newWorkspace = await createWorkspace({
        name: newWorkspaceName,
        description: newWorkspaceDescription,
        project_ref: selectedProjectId,
      });

      await refreshWorkspaces();
      setCurrentWorkspace(newWorkspace);

      toast({
        title: "Workspace created",
        description: `${newWorkspaceName} has been created successfully`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast({
        title: "Failed to create workspace",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreateWorkspace} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Workspace Name</Label>
        <Input
          id="workspace-name"
          placeholder="Enter workspace name"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          disabled={isCreating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workspace-description">Description</Label>
        <Input
          id="workspace-description"
          placeholder="Enter workspace description"
          value={newWorkspaceDescription}
          onChange={(e) => setNewWorkspaceDescription(e.target.value)}
          disabled={isCreating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-select">Supabase Project</Label>
        {isLoadingProjects ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading projects...</span>
          </div>
        ) : availableProjects.length > 0 ? (
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={isCreating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a Supabase project..." />
            </SelectTrigger>
            <SelectContent>
              {availableProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      project.status === "ACTIVE_HEALTHY" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    {project.name} ({project.region})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              No available projects
            </div>
            <p className="text-sm text-muted-foreground">
              All available projects are already linked to other workspaces.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating || !selectedProjectId} className="gap-2">
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Workspace
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
