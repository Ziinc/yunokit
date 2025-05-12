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
  const { refreshWorkspaces } = useWorkspace();
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
          disabled={isLoadingProjects || isCreating}
          required
        >
          <SelectTrigger id="supabase-project">
            <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} ({project.region})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button type="submit" disabled={isCreating} className="gap-2">
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
