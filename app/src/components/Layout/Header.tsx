import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search, Plus, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { NewContentDialog } from "../Content/NewContentDialog";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/contexts/SearchContext";

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery, isSearching, setIsSearching } = useSearch();
  
  // Reset search query when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes('/search')) {
      setSearchQuery("");
    }
  }, [location.pathname, setSearchQuery]);

  // Update search query from URL when on search page
  useEffect(() => {
    if (location.pathname.includes('/search')) {
      const urlParams = new URLSearchParams(location.search);
      const queryParam = urlParams.get('q');
      if (queryParam) {
        setSearchQuery(queryParam);
      }
    }
  }, [location.search, location.pathname, setSearchQuery]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      } finally {
        // Adding a slight delay to make the loading state visible
        setTimeout(() => setIsSearching(false), 500);
      }
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm h-16 flex items-center px-4 sticky top-0 z-10">

      <div className="flex-1 flex items-center mx-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-md group">
          <div className="flex rounded-md border overflow-hidden transition-all group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-2 group-focus-within:ring-offset-background">
            <Input 
              placeholder="Search content..." 
              className="border-0 flex-1 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
            />
            <Button 
              type="submit" 
              variant="secondary"
              className="rounded-none min-w-10 h-10 px-0 border-0 flex items-center justify-center"
              disabled={isSearching || !searchQuery.trim()}
              aria-label="Search"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
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
