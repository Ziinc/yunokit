import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, AlertCircle, ShoppingBag, BookOpen, GraduationCap, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { listContentItems, updateContentItem, type ContentItemRow } from '@/lib/api/ContentApi';
import { QuickstartTemplateDialog } from "@/components/Dashboard/QuickstartTemplateDialog";
import { useToast } from "@/hooks/use-toast";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { isAuthenticated } from "@/lib/api/auth";
import { formatDate } from "@/utils/formatDate";
import { listSchemas, type ContentSchemaRow } from "@/lib/api/SchemaApi";
import useSWR from "swr";
const Dashboard: React.FC = () => {
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"ecommerce" | "blogging" | "tutorials" | null>(null);
  // Track approval state by item id instead of a single global state
  const [approvingItems, setApprovingItems] = useState<Record<string, boolean>>({});
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all content items
  const { 
    data: contentResponse, 
    error: contentError, 
    isLoading: contentLoading, 
    mutate: mutateContent 
  } = useSWR(
    currentWorkspace ? `content-${currentWorkspace.id}` : null,
    () => listContentItems(currentWorkspace!.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const contentItems = contentResponse?.data || [];

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

  // Fetch recently published content
  const { 
    data: recentPublishedResponse, 
    isLoading: recentPublishedLoading 
  } = useSWR(
    currentWorkspace ? `recent-published-${currentWorkspace.id}` : null,
    () => listContentItems(currentWorkspace!.id, {
      status: "published",
      limit: 8,
      offset: 0,
      orderBy: "published_at",
      orderDirection: "desc",
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const recentlyPublishedContent = recentPublishedResponse?.data || [];

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

  const isLoading = contentLoading || recentEditedLoading || recentPublishedLoading || schemasLoading;

  const showQuickstart = schemas.length === 0 && contentItems.length === 0;

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
    if (contentError) {
      console.error("Error loading content:", contentError);
      toast({
        title: "Error loading content",
        description: "There was a problem loading your content.",
        variant: "destructive"
      });
    }
    if (schemasError) {
      console.error("Error loading schemas:", schemasError);
      toast({
        title: "Error loading schemas", 
        description: "There was a problem loading your schemas.",
        variant: "destructive"
      });
    }
  }, [contentError, schemasError, toast]);

  // Filter content by status
  const publishedContent = recentlyPublishedContent;

  const draftContent = contentItems
    .filter(item => item.status === 'draft')
    .sort((a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime())
    .slice(0, 5);

  const pendingReviewContent = contentItems
    .filter(item => item.status === 'pending_review')
    .sort((a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime())
    .slice(0, 5);


  // Find schema name
  const getSchemaName = (schemaId: number) => {
    const schema = schemas.find(s => s.id === schemaId);
    return schema?.name || schemaId.toString();
  };

  // Helper function to extract author name from email or use a default
  const getAuthorName = (item: ContentItemRow) => {
    // ContentItemRow doesn't have updatedBy/createdBy, so return a default
    return 'Unknown';
  };

  // Handle template selection
  const handleSelectTemplate = (template: "ecommerce" | "blogging" | "tutorials") => {
    setSelectedTemplate(template);
    setQuickstartDialogOpen(true);
  };

  // Handle approval of content item
  const handleApproveContent = async (item: ContentItemRow) => {
    if (!currentWorkspace || !item.id) return;
    
    try {
      // Set approving state for this specific item only
      setApprovingItems(prev => ({ ...prev, [item.id!]: true }));
      
      // Get the current timestamp
      const now = new Date().toISOString();
      
      // Optimistic update for all content lists
      const updatedItem = { ...item, status: 'published' as const, published_at: now };
      
      // Update all relevant SWR caches optimistically
      mutateContent(
        contentResponse ? { ...contentResponse, data: contentResponse.data?.map(prevItem => 
          prevItem.id === item.id ? updatedItem : prevItem
        )} : undefined, 
        false
      );
      
      // Update the content item with published status
      const response = await updateContentItem(item.id, {
        published_at: now,
      }, currentWorkspace.id);
      
      if (response.error) {
        // Revert optimistic updates on error
        mutateContent();
        console.error("Error approving content:", response.error);
        toast({
          title: "Error",
          description: "Failed to approve content. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Revalidate all content data to ensure consistency
      mutateContent();
      
      toast({
        title: "Content approved",
        description: `"${item.title}" has been approved and published.`,
        variant: "default",
      });
    } catch (error) {
      // Revert optimistic updates on exception
      mutateContent();
      console.error("Error approving content:", error);
      toast({
        title: "Error",
        description: "Failed to approve content. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear approving state for this specific item
      setApprovingItems(prev => {
        const newState = { ...prev };
        delete newState[item.id!];
        return newState;
      });
    }
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
            {getSchemaName(item.schema_id!)} • {getAuthorName(item)} • Updated {formatDate(item.updated_at!)}
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

  // Special render function for approval requests without status badge
  const renderApprovalItem = (item: ContentItemRow) => (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <Link to={`/manager/editor/${item.schema_id}/${item.id}`} className="hover:underline">
            <p className="font-medium group-hover:text-primary transition-colors">{item.title}</p>
          </Link>
          <p className="text-xs text-muted-foreground">
            {getSchemaName(item.schema_id!)} • {getAuthorName(item)} • Updated {formatDate(item.updated_at!)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          className="bg-green-600 hover:bg-green-700" 
          onClick={() => handleApproveContent(item)}
          disabled={!!approvingItems[item.id!]}
        >
          {approvingItems[item.id!] ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Approving...
            </>
          ) : (
            'Approve'
          )}
        </Button>
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
  const renderEmptyState = (type: 'recent' | 'draft' | 'published' | 'review') => {
    const config = {
      recent: {
        icon: <Clock className="h-12 w-12 text-muted-foreground" />,
        title: "No recent activity",
        description: "Content you edit will appear here"
      },
      draft: {
        icon: <FileText className="h-12 w-12 text-muted-foreground" />,
        title: "No draft content",
        description: "Content you save as draft will appear here"
      },
      published: {
        icon: <CheckCircle className="h-12 w-12 text-muted-foreground" />,
        title: "No published content",
        description: "Content you publish will appear here"
      },
      review: {
        icon: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
        title: "No content to review",
        description: "Content waiting for your review will appear here"
      }
    };

    const { icon, title, description } = config[type];

    return (
      <div className="flex flex-col items-center justify-center py-8 min-h-[200px]">
        {icon}
        <h3 className="mt-4 text-lg font-medium">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "grid grid-rows-3 gap-6",
          !isFeatureEnabled(FeatureFlags.APPROVAL_FLOWS) && "lg:col-span-2"
        )}>
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
                  renderEmptyState("recent")
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Draft Content
                </CardTitle>
                <CardDescription>
                  Content in draft stage
                </CardDescription>
              </div>
              {draftContent.length > 0 && (
                <Link 
                  to="/manager?status=draft" 
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
                ) : draftContent.length > 0 ? (
                  draftContent.map(item => renderContentItem(item))
                ) : (
                  renderEmptyState("draft")
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Published Content
                </CardTitle>
                <CardDescription>
                  Recently published content
                </CardDescription>
              </div>
              {publishedContent.length > 0 && (
                <Link 
                  to="/manager?status=published" 
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
                ) : publishedContent.length > 0 ? (
                  publishedContent.map(item => renderContentItem(item))
                ) : (
                  renderEmptyState("published")
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {isFeatureEnabled(FeatureFlags.APPROVAL_FLOWS) && (
          <div className="grid grid-rows-1 gap-6">
            <Card className="w-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Approval Requests
                  </CardTitle>
                  <CardDescription>
                    Content waiting for your review
                  </CardDescription>
                </div>
                {pendingReviewContent.length > 0 && (
                  <Link 
                    to="/manager?status=pending_review" 
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
                  ) : pendingReviewContent.length > 0 ? (
                    pendingReviewContent.map(item => renderApprovalItem(item))
                  ) : (
                    renderEmptyState("review")
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
