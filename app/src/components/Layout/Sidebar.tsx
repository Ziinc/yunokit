import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  FileText, 
  Home,
  Settings,
  Database,
  Image,
  Code,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Content Manager', path: '/manager', icon: <FileText size={20} /> },
    { name: 'Content Builder', path: '/builder', icon: <Database size={20} /> },
    { name: 'Library', path: '/library', icon: <Image size={20} /> },
    { name: 'Community', path: '/comments', icon: <MessageCircle size={20} /> },
    { name: 'Developer', path: '/developer', icon: <Code size={20} /> },
  ];

  return (
    <aside className="sidebar bg-sidebar h-screen border-r border-border w-56 flex flex-col">
      <div className="p-4 flex items-center h-16 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6">
            <img src="/supacontent-logo.png" alt="SupaContent" className="w-full h-full" />
          </div>
          <span className="font-bold text-lg">SupaContent</span>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="px-4 py-3 border-b border-border">
        <Select defaultValue="primary">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary Workspace</SelectItem>
            <SelectItem value="marketing">Marketing Team</SelectItem>
            <SelectItem value="development">Development Team</SelectItem>
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
          to="/documentation"
          className="flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors hover:bg-accent text-foreground"
        >
          <BookOpen size={20} className="fun-icon" />
          <span>Documentation</span>
        </Link>
        <Link 
          to="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors hover:bg-accent text-foreground"
        >
          <Settings size={20} className="fun-icon" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};
