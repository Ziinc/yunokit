import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiDocumentation } from "@/components/Documentation/ApiDocumentation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Database, Code } from "lucide-react";
import DatabaseMigrationPage from "./DatabaseMigrationPage";

const DeveloperPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Developer Tools</CardTitle>
          <CardDescription>
            Manage your API integrations, database migrations, and developer settings
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API Documentation
          </TabsTrigger>
          <TabsTrigger value="migrations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Migrations
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <ApiDocumentation />
        </TabsContent>

        <TabsContent value="migrations" className="space-y-4">
          <DatabaseMigrationPage />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Developer Settings</CardTitle>
              <CardDescription>Configure your development environment</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperPage;
