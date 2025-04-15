import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace } from '../workspaceSchema';
import { WorkspaceApi } from '../api/WorkspaceApi';
import { initializeApiStorage } from '../api';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadWorkspaces = async () => {
    try {
      console.log('Loading workspaces...');
      setIsLoading(true);
      await initializeApiStorage();
      const loadedWorkspaces = await WorkspaceApi.getWorkspaces();
      console.log('Loaded workspaces:', loadedWorkspaces);
      setWorkspaces(loadedWorkspaces);
      
      // Set initial workspace if none selected
      if (!currentWorkspace && loadedWorkspaces.length > 0) {
        console.log('Setting initial workspace:', loadedWorkspaces[0]);
        setCurrentWorkspace(loadedWorkspaces[0]);
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider 
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        setCurrentWorkspace,
        refreshWorkspaces: loadWorkspaces
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};