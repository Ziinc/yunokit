
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, List } from "lucide-react";
import { Link } from "react-router-dom";

export const ContentTypesSystem: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Types System</CardTitle>
        <CardDescription>
          Understanding and configuring content schemas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">What are Content Types?</h3>
          <p>
            Content types (or schemas) define the structure and format of your content. They consist of a collection of fields
            that determine what information can be stored and how it's presented to content editors.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium mb-2">Two Types of Schemas</h4>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Collection</Badge>
                    <span className="font-medium">Multiple content items</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Used for content that has multiple entries, such as blog posts, products, or team members.
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Single</Badge>
                    <span className="font-medium">One content item</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Used for unique content like homepage, about page, or global settings.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Schema Components</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Name & Description:</strong> Identify and explain the purpose of the schema
                </li>
                <li>
                  <strong>Fields:</strong> The data points that make up the content structure
                </li>
                <li>
                  <strong>Validations:</strong> Rules that ensure data integrity
                </li>
                <li>
                  <strong>Relationships:</strong> Connections between different content types
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Example Schema: Blog Post</h3>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Field Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Title</TableCell>
                  <TableCell>Markdown</TableCell>
                  <TableCell>The title of the blog post</TableCell>
                  <TableCell>
                    <Check size={16} className="text-green-500 mx-auto" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Content</TableCell>
                  <TableCell>Markdown</TableCell>
                  <TableCell>The main content of the blog post</TableCell>
                  <TableCell>
                    <Check size={16} className="text-green-500 mx-auto" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Featured</TableCell>
                  <TableCell>Boolean</TableCell>
                  <TableCell>Whether the post should be featured</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Category</TableCell>
                  <TableCell>Enum</TableCell>
                  <TableCell>The category of the blog post</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tags</TableCell>
                  <TableCell>Multiselect</TableCell>
                  <TableCell>Tags associated with the post</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Related Posts</TableCell>
                  <TableCell>Relation</TableCell>
                  <TableCell>Other related blog posts</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Publish Date</TableCell>
                  <TableCell>DateTime</TableCell>
                  <TableCell>When the post should be published</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Featured Image</TableCell>
                  <TableCell>Asset</TableCell>
                  <TableCell>The main image for the blog post</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4">
            <Link to="/content-schemas">
              <Button variant="outline" className="gap-2">
                <List size={16} />
                <span>Explore Content Schemas</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
