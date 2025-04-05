import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useToast } from "@/hooks/use-toast";

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-grow overflow-hidden">
        <Header />
        <main className="flex-grow overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
