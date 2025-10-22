import React, { createContext, useContext } from "react";
import useSWR from "swr";
import { getWorkspaces, WorkspaceRow } from "../api/WorkspaceApi";
import { useNullableState } from "@/hooks/useNullableState";

interface WorkspaceContextType {
  workspaces: WorkspaceRow[];
  currentWorkspace: WorkspaceRow | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentWorkspace: (workspace: WorkspaceRow | null) => void;
  mutate: () => Promise<WorkspaceRow[] | void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentWorkspace, setCurrentWorkspaceState] =
    useNullableState<WorkspaceRow>(null);
  const [initialized, setInitialized] = React.useState(false);

  const clearCurrentWorkspace = React.useCallback(() => {
    setCurrentWorkspaceState(null);
    localStorage.removeItem("currentWorkspaceId");
  }, []);

  const {
    data: workspaces = [],
    error,
    isLoading,
    mutate,
  } = useSWR<WorkspaceRow[]>("workspaces", getWorkspaces);

  // Restore workspace from localStorage when workspaces are loaded
  React.useEffect(() => {
    // Only run this effect when SWR has finished loading (not on initial load)
    if (!isLoading) {
      if (workspaces.length > 0) {
        const storedId = localStorage.getItem("currentWorkspaceId");
        if (storedId) {
          const ws = workspaces.find(w => String(w.id) === storedId);
          // Only restore workspace if it exists and has a project_ref
          if (ws && ws.project_ref) {
            setCurrentWorkspaceState(ws);
          } else if (ws && !ws.project_ref) {
            // Clear invalid workspace from localStorage
            clearCurrentWorkspace();
          }
        }
      }
      // Always set initialized to true once workspaces have been loaded (even if empty)
      setInitialized(true);
    }
  }, [workspaces, isLoading]);

  // Update current workspace reference when workspaces are refreshed
  React.useEffect(() => {
    if (initialized && currentWorkspace && workspaces.length > 0) {
      const updatedWorkspace = workspaces.find(w => w.id === currentWorkspace.id);
      if (updatedWorkspace && updatedWorkspace.project_ref) {
        setCurrentWorkspaceState(updatedWorkspace);
      } else if (updatedWorkspace && !updatedWorkspace.project_ref) {
        // Workspace lost its project_ref, clear it
        clearCurrentWorkspace();
      } else if (!updatedWorkspace) {
        // Workspace was deleted, clear it
        clearCurrentWorkspace();
      }
    }
  }, [initialized, currentWorkspace, workspaces]);

  const refreshWorkspaces = async () => {
    await mutate();
  };

  const setCurrentWorkspace = (workspace: WorkspaceRow | null) => {
    if (workspace) {
      // Only allow setting workspace if it has a project_ref
      if (workspace.project_ref) {
        localStorage.setItem("currentWorkspaceId", String(workspace.id));
        setCurrentWorkspaceState(workspace);
      }
    } else {
      clearCurrentWorkspace();
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        error,
        setCurrentWorkspace,
        mutate,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
