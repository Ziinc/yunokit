
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeSection } from "@/components/Documentation/WelcomeSection";
import { KeyConcepts } from "@/components/Documentation/KeyConcepts";
import { ContentEditorGuide } from "@/components/Documentation/ContentEditorGuide";
import { ContentTypesSystem } from "@/components/Documentation/ContentTypesSystem";
import { FieldTypesReference } from "@/components/Documentation/FieldTypesReference";
import { CommentsSystem } from "@/components/Documentation/CommentsSystem";
import { ApiDocumentation } from "@/components/Documentation/ApiDocumentation";
import { DatabaseMigrations } from "@/components/Documentation/DatabaseMigrations";
import { BestPractices } from "@/components/Documentation/BestPractices";
import { GuidesList } from "@/components/Documentation/GuidesList";

export const DocumentationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-4">
        <TabsList className="mb-4 w-full justify-start overflow-auto">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="content-management">Content Management</TabsTrigger>
          <TabsTrigger value="content-types">Content Types</TabsTrigger>
          <TabsTrigger value="field-types">Field Types</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="migrations">Database Migrations</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
        </TabsList>
        
        <TabsContent value="getting-started" className="space-y-4">
          <WelcomeSection />
          <KeyConcepts />
        </TabsContent>
        
        <TabsContent value="content-management" className="space-y-4">
          <ContentEditorGuide />
        </TabsContent>
        
        <TabsContent value="content-types" className="space-y-4">
          <ContentTypesSystem />
        </TabsContent>
        
        <TabsContent value="field-types" className="space-y-4">
          <FieldTypesReference />
        </TabsContent>
        
        <TabsContent value="comments" className="space-y-4">
          <CommentsSystem />
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <ApiDocumentation />
        </TabsContent>
        
        <TabsContent value="migrations" className="space-y-4">
          <DatabaseMigrations />
        </TabsContent>
        
        <TabsContent value="best-practices" className="space-y-4">
          <BestPractices />
        </TabsContent>
        
        <TabsContent value="guides" className="space-y-4">
          <GuidesList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentationPage;
