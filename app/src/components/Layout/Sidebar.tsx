import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Home,
  Database,
  Image,
  MessageCircle,
  MessageSquare,
  Loader2,
  Building2,
  Settings,
  ChevronsUpDown,
} from "lucide-react";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcherModal } from "@/components/Workspace/WorkspaceSwitcherModal";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const { currentWorkspace, isLoading } = useWorkspace();
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Content Manager", path: "/manager", icon: <FileText size={20} /> },
    { name: "Schema Builder", path: "/builder", icon: <Database size={20} /> },
    ...(isFeatureEnabled(FeatureFlags.ASSET_LIBRARY)
      ? [{ name: "Library", path: "/library", icon: <Image size={20} /> }]
      : []),
    ...(isFeatureEnabled(FeatureFlags.COMMUNITY)
      ? [
          {
            name: "Community",
            path: "/comments",
            icon: <MessageCircle size={20} />,
          },
          {
            name: "Feedback",
            path: "/feedback",
            icon: <MessageSquare size={20} />,
          },
        ]
      : []),
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full border-r w-64">
      <div className="p-4 border-b">
        <Link to="/" className="block mb-4">
          <img
            src="/branding.png"
            alt="Yunokit Logo"
            className="h-8 w-auto mx-auto"
          />
        </Link>
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsSwitcherOpen(true)}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span className="truncate text-muted-foreground">
                {currentWorkspace?.name || "Select workspace"}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              location.pathname === item.path
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
      
      <Separator className="mx-4" />
      <div className="p-4 pt-3">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            location.pathname.startsWith("/settings")
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <Settings size={20} />
          Settings
        </Link>
      </div>
      
      <WorkspaceSwitcherModal 
        open={isSwitcherOpen}
        onOpenChange={setIsSwitcherOpen}
      />
    </div>
  );
};
