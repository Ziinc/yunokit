import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ShoppingBag, BookOpen, GraduationCap, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { listContentItems, type ContentItemRow } from '@/lib/api/ContentApi';
import { QuickstartTemplateDialog } from "@/components/Dashboard/QuickstartTemplateDialog";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { isAuthenticated } from "@/lib/api/auth";
import { formatDate } from "@/utils/formatDate";
import { listSchemas } from "@/lib/api/SchemaApi";
import useSWR from "swr";

const Dashboard: React.FC = () => {
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"ecommerce" | "blogging" | "tutorials" | null>(null);
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch recently edited content
  const { 
    data: recentEditedResponse, 
    isLoading: recentEditedLoading 
  } = useSWR(
    currentWorkspace ? `recent-edited-${currentWorkspace.id}` : null,
    () => listContentItems(currentWorkspace!.id, {
      limit: 8,
      offset: 0,
      orderBy: "updated_at",
      orderDirection: "desc",
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const recentlyEditedContent = recentEditedResponse?.data || [];

  // Fetch schemas
  const { 
    data: schemasResponse, 
    error: schemasError, 
    isLoading: schemasLoading 
  } = useSWR(
    currentWorkspace ? `schemas-${currentWorkspace.id}` : null,
    () => listSchemas(currentWorkspace!.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const schemas = schemasResponse?.data || [];

  const isLoading = recentEditedLoading || schemasLoading;

  const showQuickstart = schemas.length === 0 && recentlyEditedContent.length === 0;

  // Handle authentication check
  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) {
          navigate('/signin');
          return;
        }
      } catch (error) {
        console.error('Error loading user:', error);
        navigate('/signin');
      }
    };

    loadUser();
  }, [navigate]);

  // Handle errors
  useEffect(() => {
    if (schemasError) {
      console.error("Error loading schemas:", schemasError);
      toast({
        title: "Error loading schemas", 
        description: "There was a problem loading your schemas.",
        variant: "destructive"
      });
    }
  }, [schemasError, toast]);

  // Find schema name
  const getSchemaName = (schemaId: number) => {
    const schema = schemas.find(s => s.id === schemaId);
    return schema?.name || schemaId.toString();
  };

  // Helper function to extract author name from email or use a default
  const getAuthorName = () => {
    // ContentItemRow doesn't have updatedBy/createdBy, so return a default
    return 'Unknown';
  };

  // Handle template selection
  const handleSelectTemplate = (template: "ecommerce" | "blogging" | "tutorials") => {
    setSelectedTemplate(template);
    setQuickstartDialogOpen(true);
  };

  // Render content list item
  const renderContentItem = (item: ContentItemRow) => (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <Link to={`/manager/editor/${item.schema_id}/${item.id}`} className="hover:underline">
            <p className="font-medium group-hover:text-primary transition-colors">{item.title}</p>
          </Link>
          <p className="text-xs text-muted-foreground">
            {getSchemaName(item.schema_id!)} • {getAuthorName()} • Updated {formatDate(item.updated_at!)}
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
      </div>
    </div>
  );

  // Loading placeholder
  const renderLoadingPlaceholder = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
      <p>Loading content...</p>
    </div>
  );

  // Empty state
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-8 min-h-[200px]">
        <Clock className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No recent activity</h3>
        <p className="mt-2 text-sm text-muted-foreground">Content you edit will appear here</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor your content activities
        </p>
      </div>

      {/* Quickstart Templates Section */}
      {showQuickstart && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-lg">Quickstart Templates</CardTitle>
                <CardDescription>
                  Get started quickly with pre-built content schemas for common use cases
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="p-4">
                  <ShoppingBag className="h-12 w-12 text-cms-purple mb-3" />
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
                    <span>Use Template</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="p-4">
                  <BookOpen className="h-12 w-12 text-cms-blue mb-3" />
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
                    <span>Use Template</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="p-4">
                  <GraduationCap className="h-12 w-12 text-cms-orange mb-3" />
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
                    <span>Use Template</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card className="w-full">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Last Edited
              </CardTitle>
              <CardDescription>
                Recently updated content
              </CardDescription>
            </div>
            {recentlyEditedContent.length > 0 && (
              <Link 
                to="/manager?sort=updatedAt" 
                className="text-sm text-primary font-medium flex items-center hover:underline"
              >
                View more
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            )}
          </CardHeader>
          <CardContent className="px-6">
            <div className="divide-border divide-y">
              {isLoading ? (
                renderLoadingPlaceholder()
              ) : recentlyEditedContent.length > 0 ? (
                recentlyEditedContent.map(item => renderContentItem(item))
              ) : (
                renderEmptyState()
              )}
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
