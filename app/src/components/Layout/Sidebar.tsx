
import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  FileText, 
  Home,
  Settings,
  Sparkles,
  Database,
  Image,
  Code,
  BookOpen,
  CreditCard,
  MessageCircle,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Content Manager', path: '/manager', icon: <FileText size={20} /> },
    { name: 'Content Type Builder', path: '/builder', icon: <Database size={20} /> },
    { name: 'Assets Library', path: '/library', icon: <Image size={20} /> },
    { name: 'Comments', path: '/comments', icon: <MessageCircle size={20} /> },
    { name: 'Developer', path: '/developer', icon: <Code size={20} />, subItems: [
      { name: 'API Docs', path: '/developer/api' },
      { name: 'Database Migrations', path: '/developer/migrations' }
    ]},
  ];

  return (
    <aside 
      className={cn(
        "sidebar bg-sidebar h-screen border-r border-border transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="p-4 flex items-center justify-center h-16 border-b border-border">
        <div className={cn("flex items-center gap-2", !isOpen && "justify-center")}>
          <div className="p-1.5 rounded-md bg-gradient-to-br from-cms-purple to-cms-blue animate-pulse-gentle">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {isOpen && <span className="font-bold text-lg">FunCMS</span>}
        </div>
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
                  : "hover:bg-accent text-foreground hover:text-accent-foreground",
                !isOpen && "justify-center px-2"
              )}
            >
              <span className="fun-icon">{item.icon}</span>
              {isOpen && <span>{item.name}</span>}
            </Link>
            
            {isOpen && item.subItems && (
              <div className="ml-9 my-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    className={cn(
                      "flex items-center py-1.5 px-2 text-sm rounded-md transition-colors",
                      location.pathname === subItem.path
                        ? "bg-accent/80 text-accent-foreground"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <Link 
          to="/documentation"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors hover:bg-accent text-foreground",
            !isOpen && "justify-center px-2"
          )}
        >
          <BookOpen size={20} className="fun-icon" />
          {isOpen && <span>Documentation</span>}
        </Link>
        <Link 
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors hover:bg-accent text-foreground",
            !isOpen && "justify-center px-2"
          )}
        >
          <Settings size={20} className="fun-icon" />
          {isOpen && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
};
