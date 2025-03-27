
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContentStatusBadge } from "@/components/Content/ContentList/ContentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export const ContentEditorGuide: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Editor Guide</CardTitle>
        <CardDescription>
          Learn how to use the Content Editor to manage your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Content Editor Overview</h3>
          <p>
            The Content Editor is the central hub for managing all your content. It provides a comprehensive interface
            for creating, editing, reviewing, and publishing content across your application.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium mb-2">Main Features</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                <li>Content listing with pagination</li>
                <li>Advanced filtering by schema, status, and author</li>
                <li>Content workflow management</li>
                <li>Comments and review system</li>
                <li>Publishing controls</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Content Statuses</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ContentStatusBadge status="draft" />
                  <span>Content that is being worked on and not ready for review</span>
                </div>
                <div className="flex items-center gap-2">
                  <ContentStatusBadge status="pending_review" />
                  <span>Content ready for review before publishing</span>
                </div>
                <div className="flex items-center gap-2">
                  <ContentStatusBadge status="published" />
                  <span>Content that is live and visible to users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Working with the Content Table</h3>
          <p>
            The content table displays all content items with key information including title, schema type, status, 
            and related metadata. Here's how to use it effectively:
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Filtering Content</h4>
              <p className="text-muted-foreground">
                Use the filter form at the top of the content table to narrow down content by:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                <li><strong>Schema Type:</strong> Filter by content type (Blog Posts, Products, etc.)</li>
                <li><strong>Status:</strong> View only draft, pending review, or published content</li>
                <li><strong>Author:</strong> See content created by specific team members</li>
                <li><strong>Search:</strong> Find content by title or content text</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Pagination</h4>
              <p className="text-muted-foreground">
                Navigate through your content using the pagination controls at the bottom of the table. You can:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                <li>Go to the previous or next page</li>
                <li>Jump to a specific page</li>
                <li>Control how many items to display per page</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Creating New Content</h4>
              <p className="text-muted-foreground">
                To create new content, click the "Create New" button and select the content type from the dropdown menu.
                This will take you to the content editor with an empty template based on the selected schema.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Editing and Reviewing Content</h4>
              <p className="text-muted-foreground">
                Click on any row in the table to open that content item. From there, you can edit its fields, change its 
                status, add comments, or proceed with the review process.
              </p>
            </div>
          </div>
        </div>
        
        <Alert>
          <AlertDescription>
            <strong>Pro Tip:</strong> Save frequent filter combinations for quick access to your most-used content views.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
