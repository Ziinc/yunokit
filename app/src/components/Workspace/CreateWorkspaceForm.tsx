import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { WorkspaceApi } from "@/lib/api/WorkspaceApi";
import { WorkspaceLimit } from "@/lib/workspaceSchema";

interface CreateWorkspaceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateWorkspaceForm: React.FC<CreateWorkspaceFormProps> = ({ onSuccess, onCancel }) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceLimit, setWorkspaceLimit] = useState<WorkspaceLimit | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkWorkspaceLimit = async () => {
      try {
        const limit = await WorkspaceApi.getWorkspaceLimit();
        setWorkspaceLimit(limit);
      } catch (error) {
        console.error("Failed to check workspace limit:", error);
      }
    };

    checkWorkspaceLimit();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newWorkspaceName.trim()) {
      toast({
        title: "Workspace name required",
        description: "Please enter a workspace name",
        variant: "destructive"
      });
      return;
    }

    if (!workspaceLimit?.canCreate) {
      toast({
        title: "Workspace limit reached",
        description: `You can create up to ${workspaceLimit?.maxWorkspaces} workspaces on your current plan.`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreating(true);

      const newWorkspace = await WorkspaceApi.createWorkspace({
        name: newWorkspaceName,
        description: newWorkspaceDescription,
        ownerId: "user-1", // TODO: Get from auth context
        members: [{
          id: crypto.randomUUID(),
          userId: "user-1",
          role: "owner",
          email: "owner@example.com", // TODO: Get from auth context
          name: "John Owner" // TODO: Get from auth context
        }]
      });

      toast({
        title: "Workspace created",
        description: "Your new workspace has been created successfully"
      });

      onSuccess?.();
    } catch (error) {
      console.error("Create workspace error:", error);
      toast({
        title: "Failed to create workspace",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreateWorkspace} className="space-y-4">
      {workspaceLimit && !workspaceLimit.canCreate && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have reached your workspace limit ({workspaceLimit.currentCount}/{workspaceLimit.maxWorkspaces}). 
            Please upgrade your plan to create more workspaces.
          </AlertDescription>
        </Alert>
      )}
      
      {workspaceLimit && workspaceLimit.canCreate && workspaceLimit.currentCount === workspaceLimit.maxWorkspaces - 1 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will be your last available workspace ({workspaceLimit.currentCount + 1}/{workspaceLimit.maxWorkspaces}).
            Consider upgrading your plan if you need more.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Workspace Name</Label>
        <Input
          id="workspace-name"
          placeholder="Enter workspace name"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          disabled={isCreating || !workspaceLimit?.canCreate}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workspace-description">Description</Label>
        <Input
          id="workspace-description"
          placeholder="Enter workspace description"
          value={newWorkspaceDescription}
          onChange={(e) => setNewWorkspaceDescription(e.target.value)}
          disabled={isCreating || !workspaceLimit?.canCreate}
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
        <Button 
          type="submit" 
          disabled={isCreating || !workspaceLimit?.canCreate}
          className="gap-2"
        >
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