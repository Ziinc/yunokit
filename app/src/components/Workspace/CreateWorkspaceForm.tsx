import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { WorkspaceApi } from "@/lib/api/WorkspaceApi";

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

    try {
      setIsCreating(true);

      const newWorkspace = await WorkspaceApi.createWorkspace({
        name: newWorkspaceName,
        description: newWorkspaceDescription,
      });

      toast({
        title: "Workspace created",
        description: "Your new workspace has been created successfully",
      });

      // TODO: Redirect to the new workspace

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
