import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { WorkspaceSwitcherModal } from "@/components/Workspace/WorkspaceSwitcherModal";
import { useAuth } from "@/contexts/AuthContext";

export const AppLayout: React.FC = () => {
  const { workspaces, isLoading } = useWorkspace();
  const { isAuthenticated } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show workspace switcher if authenticated, has no workspaces, and is on sign-in page
    if (isAuthenticated && !isLoading && workspaces.length === 0 && 
        location.pathname !== '/sign-in') {
      setShowSwitcher(true);
    }
  }, [workspaces, isLoading, isAuthenticated, location.pathname]);

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
