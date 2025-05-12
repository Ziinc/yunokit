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
  const [currentWorkspace, setCurrentWorkspace] =
    React.useState<WorkspaceRow | null>(null);

  const {
    data: workspaces = [],
    error,
    isLoading,
    mutate,
  } = useSWR<WorkspaceRow[]>("workspaces", getWorkspaces);

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
