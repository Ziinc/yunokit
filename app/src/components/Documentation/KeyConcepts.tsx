
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const KeyConcepts: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Concepts</CardTitle>
        <CardDescription>
          Understanding the core concepts of YunoContent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Content Modeling</h3>
            <p className="text-muted-foreground">
              Define custom content types with flexible fields to match your application's needs.
              Create collections or single content types, define fields, and set up relationships.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Content Management</h3>
            <p className="text-muted-foreground">
              Create, edit, review, and publish content through an intuitive interface.
              Collaborate with team members through the content approval workflow.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">API-First</h3>
            <p className="text-muted-foreground">
              Access your content through a powerful API that can be used with any frontend technology.
              Built on Supabase for robust backend capabilities.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Media Management</h3>
            <p className="text-muted-foreground">
              Upload, organize, and use digital assets across your content.
              Manage images, videos, documents, and other files.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
