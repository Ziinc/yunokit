import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Code } from "lucide-react";
import { ApiDocumentation } from "@/components/Documentation/ApiDocumentation";
import DatabaseMigrationPage from "./DatabaseMigrationPage";

const DeveloperPage: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentTab = currentPath.includes("migrations") ? "migrations" : "api-docs";

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground mt-1">
          Manage your API integrations and database migrations
        </p>
      </div>

      <Tabs value={currentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-docs" asChild>
            <Link to="/developer/api-docs" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API Documentation
            </Link>
          </TabsTrigger>
          <TabsTrigger value="migrations" asChild>
            <Link to="/developer/migrations" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Migrations
            </Link>
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {currentPath === "/developer/api-docs" && <ApiDocumentation />}
          {currentPath === "/developer/migrations" && <DatabaseMigrationPage />}
        </div>
      </Tabs>
    </div>
  );
};

export default DeveloperPage;
