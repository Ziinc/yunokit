import React, { useState, useEffect } from "react";
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
import { WorkspaceApi } from "@/lib/api/WorkspaceApi";
import { Workspace } from "@/lib/workspaceSchema";

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<string>("primary");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        await WorkspaceApi.initializeStorage();
        const loadedWorkspaces = await WorkspaceApi.getWorkspaces();
        setWorkspaces(loadedWorkspaces);
        
        // Set initial workspace if none selected
        if (!currentWorkspace && loadedWorkspaces.length > 0) {
          setCurrentWorkspace(loadedWorkspaces[0].id);
        }
      } catch (error) {
        console.error("Failed to load workspaces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, [currentWorkspace]);
  
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
    setCurrentWorkspace(value);
    // Handle other workspace changes here
  };

  return (
    <aside className="sidebar bg-sidebar h-screen border-r border-border w-64 flex flex-col">
      <div className="p-3 flex items-center justify-center h-12">
        <Link to="/">
          <div className="w-32 h-8">
            <img src="/supacontent-logo.png" alt="SupaContent - Content Management System" className="w-full h-full object-contain" />
          </div>
        </Link>
      </div>

      {/* Workspace selector */}
      <div className="px-4 py-2 border-b border-border">
        <Select value={currentWorkspace} onValueChange={handleWorkspaceChange}>
          <SelectTrigger className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading workspaces...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select workspace" />
            )}
          </SelectTrigger>
          <SelectContent>
            {workspaces.map(workspace => (
              <SelectItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="add_workspace" className="cursor-pointer">
              <span className="flex items-center gap-2">
                <Plus size={16} />
                Add workspace
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <React.Fragment key={item.path}>
            <Link 
              to={item.path}
              className={cn(
                "group flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md transition-colors",
                location.pathname === item.path 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent text-foreground hover:text-accent-foreground"
              )}
            >
              <span className="fun-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          </React.Fragment>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <Link 
          to="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors hover:bg-accent text-foreground"
        >
          <Settings size={20} className="fun-icon" />
          <span>Settings</span>
        </Link>
      </div>

      <CreateWorkspaceModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </aside>
  );
};
