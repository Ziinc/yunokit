
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search, Plus, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { NewContentDialog } from "../Content/NewContentDialog";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState("primary");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock workspaces for demonstration
  const workspaces = [
    { id: "primary", name: "Primary Workspace" },
    { id: "marketing", name: "Marketing Team" },
    { id: "development", name: "Development Team" }
  ];

  const handleWorkspaceChange = (value: string) => {
    setWorkspace(value);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm h-16 flex items-center px-4 sticky top-0 z-10">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4 fun-icon">
        <Menu size={20} />
      </Button>

      {/* Workspace selector */}
      <div className="hidden md:flex md:w-64">
        <Select value={workspace} onValueChange={handleWorkspaceChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map(ws => (
              <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 flex items-center mx-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search content..." 
            className="pl-10 bg-background/50 focus:bg-background transition-colors duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <NewContentDialog>
          <Button className="gap-2 bg-cms-purple hover:bg-cms-purple/90 text-white">
            <Plus size={18} />
            <span>Create</span>
          </Button>
        </NewContentDialog>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 fun-icon">
              <User size={20} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-3">
              <div className="font-medium">User Options</div>
              <div className="border-t border-border pt-2">
                <Link to="/profile">
                  <Button variant="ghost" className="w-full justify-start" size="sm">Profile</Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" className="w-full justify-start" size="sm">Settings</Button>
                </Link>
                {user ? (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive" 
                    size="sm"
                    onClick={() => signOut()}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-primary" 
                    size="sm"
                    onClick={() => navigate('/signin')}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
