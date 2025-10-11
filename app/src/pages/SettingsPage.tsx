import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation, Navigate, Outlet } from "react-router-dom";

const SettingsPage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/settings/")[1] || "account";

  // Redirect /settings to /settings/account
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/account" replace />;
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs value={currentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account" asChild>
            <Link to="/settings/account">Account</Link>
          </TabsTrigger>
          <TabsTrigger value="workspaces" asChild>
            <Link to="/settings/workspaces">Workspaces</Link>
          </TabsTrigger>
          <TabsTrigger value="members" asChild>
            <Link to="/settings/members">Members</Link>
          </TabsTrigger>
          <TabsTrigger value="database" asChild>
            <Link to="/settings/database">Database</Link>
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
