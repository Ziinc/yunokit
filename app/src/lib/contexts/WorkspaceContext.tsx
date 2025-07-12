import React, { createContext, useContext } from "react";
import useSWR from "swr";
import { getWorkspaces, WorkspaceRow } from "../api/WorkspaceApi";

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
    React.useState<WorkspaceRow | null>(null);
  const [initialized, setInitialized] = React.useState(false);

  const {
    data: workspaces = [],
    error,
    isLoading,
    mutate,
  } = useSWR<WorkspaceRow[]>("workspaces", getWorkspaces);

  React.useEffect(() => {
    if (!initialized && workspaces.length > 0) {
      const storedId = localStorage.getItem("currentWorkspaceId");
      if (storedId) {
        const ws = workspaces.find(w => String(w.id) === storedId);
        if (ws) {
          setCurrentWorkspaceState(ws);
        }
      }
      setInitialized(true);
    }
  }, [initialized, workspaces]);

  const refreshWorkspaces = async () => {
    await mutate();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        error,
        setCurrentWorkspace: (workspace: WorkspaceRow | null) => {
          if (workspace) {
            localStorage.setItem("currentWorkspaceId", String(workspace.id));
          } else {
            localStorage.removeItem("currentWorkspaceId");
          }
          setCurrentWorkspaceState(workspace);
        },
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
