import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string;
}

const SettingsWorkspacesPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockWorkspaces = [
          { id: "1", name: "Personal", description: "My personal workspace" },
          { id: "2", name: "Team", description: "Team workspace" }
        ];
        setWorkspaces(mockWorkspaces);
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
        toast({
          title: "Error",
          description: "Failed to load workspaces",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [toast]);

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

    try {
      setIsCreating(true);

      // TODO: Replace with actual API call
      const newWorkspace = {
        id: String(workspaces.length + 1),
        name: newWorkspaceName,
        description: newWorkspaceDescription
      };

      setWorkspaces([...workspaces, newWorkspace]);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");

      toast({
        title: "Workspace created",
        description: "Your new workspace has been created successfully"
      });
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

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      // TODO: Replace with actual API call
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));

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
              {/* Existing Workspaces */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Workspaces</h3>
                {workspaces.map(workspace => (
                  <Card key={workspace.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h4 className="font-medium">{workspace.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workspace.description}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteWorkspace(workspace.id)}
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

                  <Button 
                    type="submit" 
                    disabled={isCreating}
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
                </form>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SettingsWorkspacesPage; 