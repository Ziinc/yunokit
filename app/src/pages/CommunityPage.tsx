import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";

const CommunityPage: React.FC = () => {
  const location = useLocation();

  // Redirect /community to /community/forums
  if (location.pathname === '/community') {
    return <Navigate to="/community/forums" replace />;
  }

  return <Outlet />;
};

export default CommunityPage; 