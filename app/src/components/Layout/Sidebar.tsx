import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Home,
  Database,
  Image,
  Code,
  MessageCircle,
  Plus,
  Loader2,
  Building2,
} from "lucide-react";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const { currentWorkspace, isLoading } = useWorkspace();

  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home size={20} /> },
    { name: "Content Manager", path: "/manager", icon: <FileText size={20} /> },
    { name: "Content Builder", path: "/builder", icon: <Database size={20} /> },
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
        ]
      : []),
    { name: "Developer", path: "/developer", icon: <Code size={20} /> },
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full border-r w-64">
      <div className="p-4 border-b">
        <Link to="/" className="block mb-4">
          <img
            src="/supacontent-logo.png"
            alt="SupaContent Logo"
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
              <span className="truncate">
                {currentWorkspace?.name || "Select workspace"}
              </span>
            )}
          </div>
          <Plus className="h-4 w-4" />
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
    </div>
  );
};
