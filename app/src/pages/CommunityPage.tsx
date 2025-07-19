import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation, Navigate, Outlet } from "react-router-dom";
import { MessageCircle, Users, Settings as SettingsIcon, MessageSquare, MessageSquareMore, FileText } from "lucide-react";

const CommunityPage: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split("/community/")[1] || "comments";

  // Redirect /community to /community/comments
  if (location.pathname === '/community') {
    return <Navigate to="/community/comments" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Community Management</h1>
      </div>
      
      <Tabs value={currentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="comments" asChild>
            <Link to="/community/comments" className="flex items-center gap-2">
              <MessageCircle size={16} />
              Comments
            </Link>
          </TabsTrigger>
          <TabsTrigger value="chat" asChild>
            <Link to="/community/chat" className="flex items-center gap-2">
              <MessageSquareMore size={16} />
              Chat
            </Link>
          </TabsTrigger>
          <TabsTrigger value="posts" asChild>
            <Link to="/community/posts" className="flex items-center gap-2">
              <FileText size={16} />
              Posts
            </Link>
          </TabsTrigger>
          <TabsTrigger value="forums" asChild>
            <Link to="/community/forums" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Forums
            </Link>
          </TabsTrigger>
          <TabsTrigger value="users" asChild>
            <Link to="/community/users" className="flex items-center gap-2">
              <Users size={16} />
              Users
            </Link>
          </TabsTrigger>
          <TabsTrigger value="config" asChild>
            <Link to="/community/config" className="flex items-center gap-2">
              <SettingsIcon size={16} />
              Configuration
            </Link>
          </TabsTrigger>
        </TabsList>

        <Outlet />
      </Tabs>
    </div>
  );
};

export default CommunityPage; 