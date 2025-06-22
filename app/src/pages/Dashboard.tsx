import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, AlertCircle, Plus, Edit, ShoppingBag, BookOpen, GraduationCap, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { listContentItems, saveContentItem } from '@/lib/api/ContentApi';
import { ContentItem } from "@/lib/contentSchema";
import { QuickstartTemplateDialog } from "@/components/Dashboard/QuickstartTemplateDialog";
import { toast } from "@/hooks/use-toast";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { isAuthenticated } from "@/lib/api/auth";
import { dataSbClient } from "@/lib/supabase";
const Dashboard: React.FC = () => {
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"ecommerce" | "blogging" | "tutorials" | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Track approval state by item id instead of a single global state
  const [approvingItems, setApprovingItems] = useState<Record<string, boolean>>({});
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();

  // Load content items and schemas
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

    const loadData = async () => {
      try{
        setIsLoading(true);
        const {data: items} = await listContentItems(currentWorkspace?.id);
        console.log(items)
        // const schemaData = await getSchemas(currentWorkspace?.id);
        if (items) {
          setContentItems(items);
        }
        // setSchemas(schemaData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
    if (currentWorkspace) { 
      loadData();
    }
  }, [currentWorkspace, navigate]);

  // Filter content by status
  const publishedContent = contentItems
    .filter(item => item.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.updatedAt).getTime() - new Date(a.publishedAt || a.updatedAt).getTime())
    .slice(0, 5);
  
  const draftContent = contentItems
    .filter(item => item.status === 'draft')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  const pendingReviewContent = contentItems
    .filter(item => item.status === 'pending_review')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  // Get most recently edited content
  const recentlyEditedContent = [...contentItems]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Find schema name
  const getSchemaName = (schemaId: string) => {
    const schema = schemas.find(s => s.id === schemaId);
    return schema?.name || schemaId;
  };

  // Helper function to extract author name from email or use a default
  const getAuthorName = (item: ContentItem) => {
    if (item.author?.name) return item.author.name;
    if (item.updatedBy) return item.updatedBy.split('@')[0];
    if (item.createdBy) return item.createdBy.split('@')[0];
    return 'Unknown';
  };

  // Handle template selection
  const handleSelectTemplate = (template: "ecommerce" | "blogging" | "tutorials") => {
    setSelectedTemplate(template);
    setQuickstartDialogOpen(true);
  };

  // Handle approval of content item
  const handleApproveContent = async (item: ContentItem) => {
    try {
      // Set approving state for this specific item only
      setApprovingItems(prev => ({ ...prev, [item.id]: true }));
      
      // Get the current timestamp
      const now = new Date().toISOString();
      
      // Update the content item with approved status and publish it
      const updatedItem: ContentItem = {
        ...item,
        status: 'published',
        updatedAt: now,
        publishedAt: now,
        publishedBy: 'Current User', // In a real app, get this from auth context
        reviewStatus: 'approved',
        reviewedAt: now,
        reviewedBy: 'Current User', // In a real app, get this from auth context
        reviewComments: 'Approved for publishing'
      };
      
      await saveContentItem(updatedItem);
      
      // Update the local state to remove the approved item from the list
      setContentItems(prevItems => 
        prevItems.map(prevItem => 
          prevItem.id === item.id ? updatedItem : prevItem
        )
      );
      
      toast({
        title: "Content approved",
        description: `"${item.title}" has been approved and published.`,
        variant: "default",
      });
    } catch (error) {
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
        delete newState[item.id];
        return newState;
      });
    }
  };

  // Render content list item
  const renderContentItem = (item: ContentItem) => (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <Link to={`/manager/editor/${item.schemaId}/${item.id}`} className="hover:underline">
            <p className="font-medium group-hover:text-primary transition-colors">{item.title}</p>
          </Link>
          <p className="text-xs text-muted-foreground">
            {getSchemaName(item.schemaId)} • {getAuthorName(item)} • Updated {new Date(item.updatedAt).toLocaleDateString()}
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
  const renderApprovalItem = (item: ContentItem) => (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <Link to={`/manager/editor/${item.schemaId}/${item.id}`} className="hover:underline">
            <p className="font-medium group-hover:text-primary transition-colors">{item.title}</p>
          </Link>
          <p className="text-xs text-muted-foreground">
            {getSchemaName(item.schemaId)} • {getAuthorName(item)} • Updated {new Date(item.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          className="bg-green-600 hover:bg-green-700" 
          onClick={() => handleApproveContent(item)}
          disabled={!!approvingItems[item.id]}
        >
          {approvingItems[item.id] ? (
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
      {isFeatureEnabled(FeatureFlags.QUICKSTART_TEMPLATES) && (
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
