import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, AlertCircle, Plus, Edit, ShoppingBag, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { NewContentDialog } from "@/components/Content/NewContentDialog";
import { Badge } from "@/components/ui/badge";
import { mockContentItems, exampleSchemas } from "@/lib/contentSchema";
import { QuickstartTemplateDialog } from "@/components/Dashboard/QuickstartTemplateDialog";

const Dashboard: React.FC = () => {
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"ecommerce" | "blogging" | "tutorials" | null>(null);

  // Filter content by status
  const publishedContent = mockContentItems
    .filter(item => item.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.updatedAt).getTime() - new Date(a.publishedAt || a.updatedAt).getTime())
    .slice(0, 5);
  
  const draftContent = mockContentItems
    .filter(item => item.status === 'draft')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  const pendingReviewContent = mockContentItems
    .filter(item => item.status === 'pending_review')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  // Get most recently edited content
  const recentlyEditedContent = [...mockContentItems]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Find schema name
  const getSchemaName = (schemaId: string) => {
    const schema = exampleSchemas.find(s => s.id === schemaId);
    return schema?.name || schemaId;
  };

  // Handle template selection
  const handleSelectTemplate = (template: "ecommerce" | "blogging" | "tutorials") => {
    setSelectedTemplate(template);
    setQuickstartDialogOpen(true);
  };

  // Render content list item
  const renderContentItem = (item: typeof mockContentItems[0], action?: React.ReactNode) => (
    <div className="flex items-center justify-between py-3 group border-b last:border-0">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium group-hover:text-primary transition-colors">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {getSchemaName(item.schemaId)} • Updated {new Date(item.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {item.status === 'draft' && <Badge variant="outline">Draft</Badge>}
        {item.status === 'pending_review' && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">Review</Badge>
        )}
        {item.status === 'published' && (
          <Badge variant="default" className="bg-green-100 text-green-800">Published</Badge>
        )}
        {action || (
          <Link to={`/content/${item.schemaId}/${item.id}`}>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <NewContentDialog>
          <Button className="gap-2">
            <Plus size={18} />
            <span>Create Content</span>
          </Button>
        </NewContentDialog>
      </div>

      {/* Quickstart Templates Section */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quickstart Templates</CardTitle>
          <CardDescription>
            Get started quickly with pre-built content schemas for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="p-4">
                <ShoppingBag className="h-8 w-8 text-cms-purple mb-2" />
                <CardTitle className="text-base group-hover:text-primary transition-colors">E-commerce</CardTitle>
                <CardDescription className="text-xs">
                  Products, categories, orders, and customers
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group-hover:text-primary" 
                  onClick={() => handleSelectTemplate("ecommerce")}
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="p-4">
                <BookOpen className="h-8 w-8 text-cms-blue mb-2" />
                <CardTitle className="text-base group-hover:text-primary transition-colors">Blogging</CardTitle>
                <CardDescription className="text-xs">
                  Posts, authors, categories, and comments
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group-hover:text-primary" 
                  onClick={() => handleSelectTemplate("blogging")}
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="p-4">
                <GraduationCap className="h-8 w-8 text-cms-orange mb-2" />
                <CardTitle className="text-base group-hover:text-primary transition-colors">Tutorials</CardTitle>
                <CardDescription className="text-xs">
                  Courses, lessons, quizzes, and students
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group-hover:text-primary" 
                  onClick={() => handleSelectTemplate("tutorials")}
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Last Edited
            </CardTitle>
            <CardDescription>
              Recently updated content
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="divide-y">
              {recentlyEditedContent.length > 0 ? (
                recentlyEditedContent.map(item => renderContentItem(item))
              ) : (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  No recently edited content
                </p>
              )}
            </div>
            <div className="mt-4 text-center">
              <Link to="/schemas">
                <Button variant="outline" size="sm">
                  View All Content
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Approval Requests
            </CardTitle>
            <CardDescription>
              Content waiting for your review
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="divide-y">
              {pendingReviewContent.length > 0 ? (
                pendingReviewContent.map(item => (
                  renderContentItem(item, (
                    <div className="flex gap-2">
                      <Link to={`/content/${item.schemaId}/${item.id}`}>
                        <Button variant="outline" size="sm">View Changes</Button>
                      </Link>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                    </div>
                  ))
                ))
              ) : (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  No content waiting for review
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Published Content
            </CardTitle>
            <CardDescription>
              Recently published content
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="divide-y">
              {publishedContent.length > 0 ? (
                publishedContent.map(item => renderContentItem(item))
              ) : (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  No published content
                </p>
              )}
            </div>
            <div className="mt-4 text-center">
              <Link to="/schemas">
                <Button variant="outline" size="sm">
                  View All Published
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Draft Content
            </CardTitle>
            <CardDescription>
              Content in draft stage
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="divide-y">
              {draftContent.length > 0 ? (
                draftContent.map(item => renderContentItem(item))
              ) : (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  No draft content
                </p>
              )}
            </div>
            <div className="mt-4 text-center">
              <Link to="/schemas">
                <Button variant="outline" size="sm">
                  View All Drafts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quickstart Template Dialog */}
      <QuickstartTemplateDialog
        open={quickstartDialogOpen}
        onOpenChange={setQuickstartDialogOpen}
        templateType={selectedTemplate}
      />
    </div>
  );
};

export default Dashboard;
