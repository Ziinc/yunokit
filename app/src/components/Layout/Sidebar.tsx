import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FileText, 
  Home,
  Settings,
  Database,
  Image,
  Code,
  MessageCircle,
  Plus,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { CreateWorkspaceModal } from "@/components/Workspace/CreateWorkspaceModal";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { currentWorkspace, setCurrentWorkspace, workspaces, isLoading } = useWorkspace();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Content Manager', path: '/manager', icon: <FileText size={20} /> },
    { name: 'Content Builder', path: '/builder', icon: <Database size={20} /> },
    ...(isFeatureEnabled(FeatureFlags.ASSET_LIBRARY) ? [{ name: 'Library', path: '/library', icon: <Image size={20} /> }] : []),
    ...(isFeatureEnabled(FeatureFlags.COMMUNITY) ? [{ name: 'Community', path: '/comments', icon: <MessageCircle size={20} /> }] : []),
    { name: 'Developer', path: '/developer', icon: <Code size={20} /> },
  ].filter(Boolean);

  const handleWorkspaceChange = (value: string) => {
    if (value === 'add_workspace') {
      setIsCreateModalOpen(true);
      return;
    }
    const workspace = workspaces.find(w => w.id === value);
    if (workspace) {
      setCurrentWorkspace(workspace);
      // Force reload the current page
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full border-r w-64">
      <div className="p-4 border-b">
        <Link to="/" className="block mb-4">
          <img src="/supacontent-logo.png" alt="SupaContent Logo" className="h-8 w-auto mx-auto" />
        </Link>
        <Select
          value={currentWorkspace?.id || ''}
          onValueChange={handleWorkspaceChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoading ? "Loading..." : "Select workspace"} />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map(workspace => (
              <SelectItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="add_workspace">
              <div className="flex items-center gap-2">
                <Plus size={16} />
                Add Workspace
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
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

      <div className="p-4 border-t">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            location.pathname.startsWith('/settings')
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <Settings size={20} />
          Settings
        </Link>
      </div>

      <CreateWorkspaceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};
