
import React from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewContentDialog } from "@/components/Content/NewContentDialog";
import { FileText, FileJson, Blocks, Search, Plus, Folder, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  
  // Mock data for folder contents
  const folderContents = [
    { id: 1, title: "Introduction", type: "markdown", lastEdited: "2 hours ago", path: "/editor/markdown" },
    { id: 2, title: "Product Data", type: "json", lastEdited: "Yesterday", path: "/editor/json" },
    { id: 3, title: "Homepage Layout", type: "block", lastEdited: "3 days ago", path: "/editor/block" },
    { id: 4, title: "Features Overview", type: "markdown", lastEdited: "Last week", path: "/editor/markdown" },
    { id: 5, title: "User Schema", type: "json", lastEdited: "Last week", path: "/editor/json" },
  ];
  
  // Get folder details based on ID
  const getFolderDetails = (id: string = 'docs') => {
    const folders: Record<string, { title: string, description: string }> = {
      'blog': { 
        title: "Blog Posts",
        description: "Content for your blog articles and posts"
      },
      'products': { 
        title: "Product Descriptions",
        description: "Content for product pages and descriptions"
      },
      'docs': { 
        title: "Documentation",
        description: "Technical documentation and guides"
      },
      'marketing': { 
        title: "Marketing Content",
        description: "Marketing materials and campaign content"
      },
      'templates': { 
        title: "Favorite Templates",
        description: "Reusable content templates"
      }
    };
    
    return folders[id] || { title: "Folder Contents", description: "Manage your content files" };
  };
  
  const folderDetails = getFolderDetails(folderId);
  
  const getIconForType = (type: string) => {
    switch (type) {
      case "markdown":
        return <FileText size={18} className="text-cms-purple" />;
      case "json":
        return <FileJson size={18} className="text-cms-blue" />;
      case "block":
        return <Blocks size={18} className="text-cms-orange" />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Folder className="h-8 w-8 text-cms-blue" />
            {folderDetails.title}
          </h1>
          <p className="text-muted-foreground mt-1">{folderDetails.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <NewContentDialog>
            <Button className="gap-2 bg-cms-purple hover:bg-cms-purple/90 text-white">
              <Plus size={18} />
              <span>Add Content</span>
            </Button>
          </NewContentDialog>
        </div>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search folder content..." className="pl-8" />
        </div>
      </div>
      
      <Separator />
      
      <div className="grid gap-4">
        {folderContents.map((item) => (
          <Link to={item.path} key={item.id}>
            <Card className="p-4 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-background">
                  {getIconForType(item.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Last edited: {item.lastEdited}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">{item.type}</span>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FolderPage;
