
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen as BookIcon } from "lucide-react";

export const GuidesList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookIcon className="h-5 w-5 text-indigo-500" />
          <span>Step-by-Step Guides</span>
        </CardTitle>
        <CardDescription>
          Walkthrough guides for common CMS tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Guide 1 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-4">
              <h3 className="text-lg font-medium">Building a Blog with YunoContent</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Learn how to set up a complete blog using content schemas, editors, and the API
              </p>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 1</Badge>
                  <span>Create Content Schemas</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Set up Blog Post, Author, and Category schemas with appropriate fields
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside ml-4 space-y-1">
                  <li>Create a Blog Post schema (title, content, publish date, etc.)</li>
                  <li>Create an Author schema (name, bio, photo, etc.)</li>
                  <li>Create a Category schema (name, description, etc.)</li>
                  <li>Set up relationships between schemas</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 2</Badge>
                  <span>Add Sample Content</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create initial content entries to populate your blog
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside ml-4 space-y-1">
                  <li>Add author profiles with photos and bios</li>
                  <li>Create categories for organizing content</li>
                  <li>Write sample blog posts with rich markdown content</li>
                  <li>Set featured posts and test different content states</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 3</Badge>
                  <span>Set Up Frontend Integration</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Implement API connections to display your blog content
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside ml-4 space-y-1">
                  <li>Create API queries for content listing and detail pages</li>
                  <li>Implement filtering by category and author</li>
                  <li>Set up pagination for the blog index</li>
                  <li>Create templates for rendering blog posts</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 4</Badge>
                  <span>Deploy and Monitor</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Launch your blog and track performance
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside ml-4 space-y-1">
                  <li>Set up proper caching for optimal performance</li>
                  <li>Implement analytics to track popular content</li>
                  <li>Configure notifications for new comments</li>
                  <li>Set up regular content review workflows</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Guide 2 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-4">
              <h3 className="text-lg font-medium">Setting Up a Multilingual CMS</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure YunoContent to manage content in multiple languages
              </p>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 1</Badge>
                  <span>Plan Your Localization Strategy</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine which content requires translation and how to structure it
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 2</Badge>
                  <span>Configure Content Schemas for Localization</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Set up schemas with language variants or translation relationships
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 3</Badge>
                  <span>Implement Translation Workflows</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create processes for managing translations and reviews
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 4</Badge>
                  <span>Set Up Localized API Endpoints</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Configure API to serve content based on language preferences
                </p>
              </div>
            </div>
          </div>
          
          {/* Guide 3 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-4">
              <h3 className="text-lg font-medium">Creating a Headless E-commerce System</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Build a complete product catalog and management system
              </p>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 1</Badge>
                  <span>Design Product Content Models</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create schemas for products, categories, and variations
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 2</Badge>
                  <span>Configure Product Relationships</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Set up connections between products, categories, and related items
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 3</Badge>
                  <span>Integrate with E-commerce APIs</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Connect with payment gateways, inventory, and shipping services
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Badge>Step 4</Badge>
                  <span>Implement Product Display and Search</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create frontend components for browsing and searching products
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Link to="/api-examples">
            <Button variant="outline" className="gap-2">
              <BookIcon className="h-4 w-4" />
              <span>View All Guides</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
