import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { createWorkspace } from "@/lib/api/WorkspaceApi";
import { listProjects, SupabaseProject } from "@/lib/supabase";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import useSWR from "swr";

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
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { refreshWorkspaces, setCurrentWorkspace, workspaces } = useWorkspace();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
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

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newWorkspaceName.trim()) {
      toast({
        title: "Workspace name required",
        description: "Please enter a workspace name",
        variant: "destructive",
      });
      return;
    }
    if (!selectedProjectId) {
      toast({
        title: "Supabase project required",
        description: "Please select a Supabase project",
        variant: "destructive",
      });
      return;
    }

    // Additional validation: check if project is already linked
    const linkedProjectIds = workspaces
      .filter(w => w.project_ref)
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
      setIsCreating(true);

      const newWorkspace = await createWorkspace({
        name: newWorkspaceName,
        description: newWorkspaceDescription,
        project_ref: selectedProjectId,
      });

      await refreshWorkspaces();

      toast({
        title: "Workspace created",
        description: "Your new workspace has been created successfully",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Failed to create workspace",
        description:
          error instanceof Error ? error.message : "Please try again later",
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
        <Label htmlFor="supabase-project">Supabase Project</Label>
        <Select
          value={selectedProjectId}
          onValueChange={setSelectedProjectId}
          disabled={isLoadingProjects || isCreating || availableProjects.length === 0}
          required
        >
          <SelectTrigger id="supabase-project">
            <SelectValue placeholder={
              isLoadingProjects 
                ? "Loading projects..." 
                : availableProjects.length === 0
                ? "No available projects"
                : "Select a project"
            } />
          </SelectTrigger>
          <SelectContent>
            {availableProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} ({project.region})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isLoadingProjects && availableProjects.length === 0 && (
          <p className="text-sm text-muted-foreground">
            All available projects are already linked to other workspaces.
          </p>
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
        <Button type="submit" disabled={isCreating || availableProjects.length === 0} className="gap-2">
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
