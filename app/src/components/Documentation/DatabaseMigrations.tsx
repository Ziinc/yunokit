
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Server, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const DatabaseMigrations: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span>Database Migrations</span>
        </CardTitle>
        <CardDescription>
          Managing schema changes and database evolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">What are Database Migrations?</h3>
          <p>
            Database migrations are version-controlled changes to your database schema that allow you to evolve your data 
            structure over time. In FunCMS, migrations help you safely manage schema changes across environments.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Key Migration Concepts</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Versioning:</strong> Each migration has a version number (e.g., 1.0.0)
                </li>
                <li>
                  <strong>Up/Down:</strong> Migrations can be applied (up) or rolled back (down)
                </li>
                <li>
                  <strong>Sequencing:</strong> Migrations are applied in order based on version
                </li>
                <li>
                  <strong>Safety:</strong> Migrations are designed to be safe and non-destructive
                </li>
                <li>
                  <strong>Environments:</strong> Migrations sync schemas across development, staging, and production
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Types of Schema Changes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Adding tables:</strong> Creating new content schema tables
                </li>
                <li>
                  <strong>Adding columns:</strong> Adding new fields to existing schemas
                </li>
                <li>
                  <strong>Modifying columns:</strong> Changing field types or constraints
                </li>
                <li>
                  <strong>Removing columns:</strong> Safely removing unused fields
                </li>
                <li>
                  <strong>Indexes:</strong> Adding or removing indexes for performance
                </li>
                <li>
                  <strong>Foreign keys:</strong> Managing relationships between content types
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Migration Workflow Example</h3>
          
          <div className="space-y-4">
            <div className="rounded-md border p-4 bg-muted/30">
              <h4 className="font-medium mb-2">1. Create a New Migration</h4>
              <p className="text-sm text-muted-foreground mb-3">
                When you add a new field to a content schema, a migration is automatically generated:
              </p>
              <pre className="text-xs bg-black text-white p-3 rounded overflow-x-auto">
{`-- Migration: 1.2.0_add_author_bio
-- Created: 2023-09-05

-- Add author_bio column to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN author_bio TEXT;

-- Add comment for documentation
COMMENT ON COLUMN blog_posts.author_bio IS 'Biography of the post author';`}
              </pre>
            </div>
            
            <div className="rounded-md border p-4 bg-muted/30">
              <h4 className="font-medium mb-2">2. Review and Apply Migration</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Review the migration in the Database Migrations panel and apply it to update your database:
              </p>
              <div className="p-3 rounded border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">1.2.0</Badge>
                    <span className="text-sm font-medium">add_author_bio</span>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Add author biography field to blog posts
                </p>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <ArrowRight size={12} />
                    <span>Apply</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border p-4 bg-muted/30">
              <h4 className="font-medium mb-2">3. Synchronize Environments</h4>
              <p className="text-sm text-muted-foreground">
                When deploying to production, run all pending migrations to ensure database schemas are in sync:
              </p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-green-500" />
                  <span className="text-sm">Development: <Badge className="bg-green-500">Migration Applied</Badge></span>
                </div>
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-green-500" />
                  <span className="text-sm">Staging: <Badge className="bg-green-500">Migration Applied</Badge></span>
                </div>
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-amber-500" />
                  <span className="text-sm">Production: <Badge variant="secondary">Pending</Badge></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Link to="/database-migrations">
              <Button className="gap-2">
                <Database className="h-4 w-4" />
                <span>Go to Database Migrations</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
