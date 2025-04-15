import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation, Navigate, Outlet } from "react-router-dom";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

const SettingsPage: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/settings/")[1] || "account";
  const { currentWorkspace } = useWorkspace();

  // Redirect /settings to /settings/account
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/account" replace />;
  }

  if (!currentWorkspace) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <p className="text-muted-foreground">
          Please select a workspace to continue
        </p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs value={currentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account" asChild>
            <Link to="/settings/account">Account</Link>
          </TabsTrigger>
          <TabsTrigger value="supabase" asChild>
            <Link to="/settings/supabase">Supabase</Link>
          </TabsTrigger>
          <TabsTrigger value="workspaces" asChild>
            <Link to="/settings/workspaces">Workspaces</Link>
          </TabsTrigger>
          <TabsTrigger value="members" asChild>
            <Link to="/settings/members">Members</Link>
          </TabsTrigger>
          <TabsTrigger value="billing" asChild>
            <Link to="/settings/billing">Billing</Link>
          </TabsTrigger>
        </TabsList>

        <Outlet />
      </Tabs>
    </div>
  );
};

export default SettingsPage;

