import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { WorkspaceSwitcherModal } from "@/components/Workspace/WorkspaceSwitcherModal";
import { useAuth } from "@/contexts/AuthContext";

export const AppLayout: React.FC = () => {
  const { currentWorkspace, isLoading, workspaces } = useWorkspace();
  const { isAuthenticated } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show workspace switcher if authenticated, not loading, and has no current workspace
    if (isAuthenticated && !isLoading) {
      if (!currentWorkspace) {
        setShowSwitcher(true);
      } else {
        setShowSwitcher(false);
      }
    }
  }, [currentWorkspace, isLoading, isAuthenticated]);

  // Show loading state while workspace context is initializing
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col w-full overflow-hidden">
        <Header />
        <main className="flex-grow overflow-auto p-4">
          <Outlet />
        </main>
      </div>
      {isAuthenticated && (
        <WorkspaceSwitcherModal 
          open={showSwitcher}
          onOpenChange={setShowSwitcher}
        />
      )}
    </div>
  );
};
