import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Home,
  Database,
  MessageCircle,
  Loader2,
  Building2,
  Settings,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Folder,
  Users,
} from "lucide-react";

import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcherModal } from "@/components/Workspace/WorkspaceSwitcherModal";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  name: string;
  icon: React.ReactNode;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const { currentWorkspace, isLoading } = useWorkspace();

  const standaloneItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
  ];

  const navGroups: NavGroup[] = [
    {
      name: "Content",
      icon: <Folder size={16} />,
      items: [
        { name: "Content Manager", path: "/manager", icon: <FileText size={20} /> },
        { name: "Schema Builder", path: "/builder", icon: <Database size={20} /> },
      ],
    },
    {
      name: "Community",
      icon: <Users size={16} />,
      items: [
        {
          name: "Forums",
          path: "/community",
          icon: <MessageCircle size={20} />,
        },
      ],
    },
  ].filter(Boolean) as NavGroup[];

  // Auto-expand the group that contains the current page
  const getActiveGroup = () => {
    return navGroups.find(group => 
      group.items.some(item => 
        location.pathname === item.path || location.pathname.startsWith(item.path + "/")
      )
    );
  };

  const activeGroup = getActiveGroup();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(activeGroup ? [activeGroup.name.toLowerCase()] : [])
  );

  // Update expanded groups when location changes
  React.useEffect(() => {
    const currentActiveGroup = getActiveGroup();
    if (currentActiveGroup) {
      setExpandedGroups(prev => new Set([...prev, currentActiveGroup.name.toLowerCase()]));
    }
  }, [location.pathname]);

  const toggleGroup = (groupName: string) => {
    // Don't allow collapsing if this group is currently active
    const group = navGroups.find(g => g.name.toLowerCase() === groupName);
    const isActive = group ? isGroupActive(group) : false;
    
    setExpandedGroups(prev => {
      const currentActiveGroup = getActiveGroup();
      const activeGroupName = currentActiveGroup?.name.toLowerCase();
      
      // If clicking the currently expanded group and it's not active, collapse it
      if (prev.has(groupName) && !isActive) {
        // Collapse this group but keep active group expanded
        const newExpanded = new Set<string>();
        if (activeGroupName) {
          newExpanded.add(activeGroupName);
        }
        return newExpanded;
      } else {
        // Expand this group and collapse all others except the active group
        const newExpanded = new Set<string>();
        
        // Always keep the active group expanded
        if (activeGroupName) {
          newExpanded.add(activeGroupName);
        }
        
        // Add the clicked group
        newExpanded.add(groupName);
        
        return newExpanded;
      }
    });
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => 
      location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    );
  };

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
        {/* Standalone items */}
        {standaloneItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}

        {/* Grouped items */}
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.name.toLowerCase());
          const isActive = isGroupActive(group);
          
          return (
            <div key={group.name} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.name.toLowerCase())}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors w-full text-left",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                {group.icon}
                {group.name}
              </button>
              
              {isExpanded && (
                <div className="ml-4 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
