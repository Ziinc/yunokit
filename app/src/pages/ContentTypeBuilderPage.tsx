import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, FileText, Edit, Search, Files, File, Layers, Archive, Trash2, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ContentSchemaEditor } from "@/components/Content/ContentSchemaEditor";
import { ContentSchema, exampleSchemas, mockContentItems, ContentItem, ContentItemStatus } from "@/lib/contentSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "@/components/Content/ContentList/PaginationControls";
import { DocsButton } from "@/components/ui/DocsButton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SelectionActionsBar } from "@/components/ui/SelectionActionsBar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// Simple query parser for search filtering
const parseQuery = (query: string) => {
  const filters: Record<string, string> = {};
  
  // Extract quoted phrases first
  const quotedRegex = /"([^"]+)"/g;
  let match;
  let processedQuery = query;
  
  while ((match = quotedRegex.exec(query)) !== null) {
    processedQuery = processedQuery.replace(match[0], '');
  }
  
  // Process key:value pairs
  const parts = processedQuery.split(' ').filter(Boolean);
  
  for (const part of parts) {
    if (part.includes(':')) {
      const [key, value] = part.split(':');
      filters[key.toLowerCase()] = value;
    }
  }
  
  // Extract general search term (without key:value parts)
  const searchTerms = parts.filter(part => !part.includes(':')).join(' ');
  
  return { filters, searchTerms };
};

// Filter content items based on search query
const filterContentItems = (items: ContentItem[], query: string) => {
  if (!query.trim()) return items;
  
  const { filters, searchTerms } = parseQuery(query);
  
  return items.filter(item => {
    // Check filters
    for (const [key, value] of Object.entries(filters)) {
      switch (key) {
        case 'status':
          if (item.status !== value) return false;
          break;
        case 'draft':
          if (value === 'true' && item.status !== 'draft') return false;
          if (value === 'false' && item.status === 'draft') return false;
          break;
        case 'published':
          if (value === 'true' && item.status !== 'published') return false;
          if (value === 'false' && item.status === 'published') return false;
          break;
        case 'author':
          const author = item.createdBy?.split('@')[0] || '';
          if (!author.toLowerCase().includes(value.toLowerCase())) return false;
          break;
        // Add more filters as needed
      }
    }
    
    // Check general search term
    if (searchTerms) {
      const searchLower = searchTerms.toLowerCase();
      const titleMatches = item.title.toLowerCase().includes(searchLower);
      const contentMatches = JSON.stringify(getContentField(item)).toLowerCase().includes(searchLower);
      
      if (!titleMatches && !contentMatches) return false;
    }
    
    return true;
  });
};

// Helper function to get content fields (supporting both data and content)
const getContentField = (item: ContentItem) => {
  // Prioritize data field, then fall back to content field
  return item.data || item.content || {};
};

const ContentSchemasPage: React.FC = () => {
  const [schemas, setSchemas] = useState<ContentSchema[]>(exampleSchemas);
  const [editingSchema, setEditingSchema] = useState<ContentSchema | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"schemas" | "content">("schemas");
  const [schemaTypeFilter, setSchemaTypeFilter] = useState<"all" | "collection" | "single">("all");
  const [schemasPerPage, setSchemasPerPage] = useState(10);
  const [contentItemsPerPage, setContentItemsPerPage] = useState(10);
  const [currentSchemasPage, setCurrentSchemasPage] = useState(1);
  const [currentContentPage, setCurrentContentPage] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSchemas, setSelectedSchemas] = useState<ContentSchema[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [schemaToDelete, setSchemaToDelete] = useState<ContentSchema | null>(null);

  // Define table columns
  const schemaColumns = [
    {
      header: "",
      cell: (schema: ContentSchema) => (
        <Checkbox
          checked={selectedSchemas.includes(schema)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedSchemas([...selectedSchemas, schema]);
            } else {
              setSelectedSchemas(selectedSchemas.filter(s => s.id !== schema.id));
            }
          }}
        />
      ),
      className: "w-[30px]"
    },
    {
      header: "Title",
      cell: (schema: ContentSchema) => (
        <div className="font-medium">{schema.name}</div>
      )
    },
    {
      header: "Schema",
      cell: (schema: ContentSchema) => (
        <Badge variant={schema.isCollection ? "default" : "outline"}>
          {schema.isCollection ? "Collection" : "Single"}
        </Badge>
      )
    },
    {
      header: "Fields",
      cell: (schema: ContentSchema) => (
        <div>{schema.fields.length} field{schema.fields.length !== 1 && "s"}</div>
      )
    },
    {
      header: "Description",
      cell: (schema: ContentSchema) => (
        <div className="max-w-xs truncate">{schema.description || "No description"}</div>
      )
    },
    {
      header: "",
      cell: (schema: ContentSchema) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditContent(schema.id)}
          >
            <Edit size={16} className="mr-2" />
            Edit Content
          </Button>
          {selectedSchemas.length === 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingSchema(schema)}>
                  <Settings size={16} className="mr-2" />
                  Manage Schema
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleArchiveSchema(schema)}
                  className={schema.isArchived ? "text-primary" : "text-muted-foreground"}
                >
                  <Archive size={16} className="mr-2" />
                  {schema.isArchived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteSchema(schema)}
                  className="text-destructive"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
      className: "text-right"
    }
  ];

  const contentColumns = [
    {
      header: "Title",
      cell: (item: ContentItem) => (
        <div className="font-medium">{item.title}</div>
      )
    },
    {
      header: "Status",
      cell: (item: ContentItem) => renderStatusBadge(item.status)
    },
    {
      header: "Last Updated",
      cell: (item: ContentItem) => (
        <div>{new Date(item.updatedAt).toLocaleDateString()}</div>
      )
    },
    {
      header: "",
      cell: (item: ContentItem) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditContent(item.schemaId, item.id)}
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground"
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleDeleteContent(item)}
                className="text-destructive"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right"
    }
  ];

  // Filter schemas based on type filter
  const filteredSchemas = useMemo(() => {
    const filtered = schemas.filter(schema => {
      if (schemaTypeFilter === "all") return true;
      if (schemaTypeFilter === "collection") return schema.isCollection;
      if (schemaTypeFilter === "single") return !schema.isCollection;
      return true;
    });
    
    // Apply search filter
    if (!searchQuery) return filtered;
    return filtered.filter(schema => 
      schema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (schema.description && schema.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [schemas, schemaTypeFilter, searchQuery]);

  // Filter content items based on search query
  const filteredContentItems = useMemo(() => {
    return filterContentItems(mockContentItems, searchQuery);
  }, [searchQuery]);

  // Get paginated schemas
  const paginatedSchemas = useMemo(() => {
    const startIndex = (currentSchemasPage - 1) * schemasPerPage;
    const endIndex = startIndex + schemasPerPage;
    return filteredSchemas.slice(startIndex, endIndex);
  }, [filteredSchemas, currentSchemasPage, schemasPerPage]);

  // Get paginated content items
  const paginatedContentItems = useMemo(() => {
    const startIndex = (currentContentPage - 1) * contentItemsPerPage;
    const endIndex = startIndex + contentItemsPerPage;
    return filteredContentItems.slice(startIndex, endIndex);
  }, [filteredContentItems, currentContentPage, contentItemsPerPage]);

  // Total pages for schemas
  const totalSchemaPages = Math.ceil(filteredSchemas.length / schemasPerPage);
  
  // Total pages for content items
  const totalContentPages = Math.ceil(filteredContentItems.length / contentItemsPerPage);

  const handleCreateSchema = (schema: ContentSchema) => {
    setSchemas([...schemas, schema]);
    setIsCreating(false);
    toast({
      title: "Schema created",
      description: `${schema.name} schema has been created successfully`,
    });
  };

  const handleUpdateSchema = (updatedSchema: ContentSchema) => {
    setSchemas(schemas.map(schema => 
      schema.id === updatedSchema.id ? updatedSchema : schema
    ));
    setEditingSchema(null);
    toast({
      title: "Schema updated",
      description: `${updatedSchema.name} schema has been updated successfully`,
    });
  };

  const handleEditContent = (schemaId: string, contentId?: string) => {
    const path = contentId 
      ? `/content/${schemaId}/${contentId}` 
      : `/content/${schemaId}`;
    navigate(path);
  };

  const renderStatusBadge = (status: ContentItemStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending_review':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending Review</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-100 text-green-800">Published</Badge>;
      default:
        return null;
    }
  };

  const handleArchiveSchema = async (schema: ContentSchema) => {
    try {
      const updatedSchema = { ...schema, isArchived: !schema.isArchived };
      setSchemas(schemas.map(s => s.id === schema.id ? updatedSchema : s));
      
      toast({
        title: schema.isArchived ? "Schema unarchived" : "Schema archived",
        description: `${schema.name} has been ${schema.isArchived ? 'unarchived' : 'archived'} successfully.`,
      });
    } catch (error) {
      console.error("Error archiving schema:", error);
      toast({
        title: "Action failed",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveSchemas = async () => {
    try {
      const updatedSchemas = schemas.map(schema => 
        selectedSchemas.includes(schema) ? { ...schema, isArchived: true } : schema
      );
      setSchemas(updatedSchemas);
      setSelectedSchemas([]);
      
      toast({
        title: "Schemas archived",
        description: `Successfully archived ${selectedSchemas.length} schema${selectedSchemas.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error("Error archiving schemas:", error);
      toast({
        title: "Archive failed",
        description: "There was an error archiving the selected schemas.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchema = async (schema: ContentSchema) => {
    setSchemaToDelete(schema);
    setShowDeleteDialog(true);
  };

  const handleDeleteContent = async (item: ContentItem) => {
    try {
      // Here you would typically call your API to delete the content
      const updatedItems = mockContentItems.filter(i => i.id !== item.id);
      // Update your state management accordingly
      
      toast({
        title: "Content deleted",
        description: `${item.title} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the content.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteSchema = async () => {
    if (!schemaToDelete) return;
    
    try {
      setSchemas(schemas.filter(s => s.id !== schemaToDelete.id));
      setShowDeleteDialog(false);
      setSchemaToDelete(null);
      
      toast({
        title: "Schema deleted",
        description: `${schemaToDelete.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting schema:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the schema.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Content Schema Builder</h1>
            <DocsButton href="https://docs.supacontent.tznc.net/schema-builder" />
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your content schemas for your content items.
          </p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Create Schema
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <ContentSchemaEditor onSave={handleCreateSchema} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs 
        value={activeView} 
        onValueChange={(v) => setActiveView(v as "schemas" | "content")}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
      
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder={activeView === "schemas" ? "Search schemas..." : "Search content... (try status:draft or author:alex)"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <TabsContent value="schemas" className="mt-4">
          <div className="rounded-md border bg-white">
            <div className="mb-4">
              <Tabs 
                value={schemaTypeFilter} 
                onValueChange={(v) => setSchemaTypeFilter(v as "all" | "collection" | "single")}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Layers size={16} />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="collection" className="flex items-center gap-2">
                    <Files size={16} />
                    Collections
                  </TabsTrigger>
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <File size={16} />
                    Singles
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">
                        <Checkbox
                          checked={selectedSchemas.length === paginatedSchemas.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSchemas(paginatedSchemas);
                            } else {
                              setSelectedSchemas([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Schema</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  {selectedSchemas.length > 0 && (
                    <SelectionActionsBar
                      selectedCount={selectedSchemas.length}
                      actions={[
                        {
                          label: "Archive",
                          icon: <Archive size={16} />,
                          onClick: handleArchiveSchemas,
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 size={16} />,
                          onClick: () => setShowDeleteDialog(true),
                          variant: "destructive",
                        },
                      ]}
                    />
                  )}
                  <TableBody>
                    {paginatedSchemas.map((schema) => (
                      <TableRow 
                        key={schema.id}
                        className={cn(
                          schema.isArchived && "opacity-60",
                          selectedSchemas.includes(schema) && "bg-muted/50"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedSchemas.includes(schema)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSchemas([...selectedSchemas, schema]);
                              } else {
                                setSelectedSchemas(selectedSchemas.filter(s => s.id !== schema.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{schema.name}</TableCell>
                        <TableCell>
                          <Badge variant={schema.isCollection ? "default" : "outline"}>
                            {schema.isCollection ? "Collection" : "Single"}
                          </Badge>
                        </TableCell>
                        <TableCell>{schema.fields.length} field{schema.fields.length !== 1 && "s"}</TableCell>
                        <TableCell className="max-w-xs truncate">{schema.description || "No description"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditContent(schema.id)}
                            >
                              <Edit size={16} className="mr-2" />
                              Edit Content
                            </Button>
                            {selectedSchemas.length === 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-muted-foreground"
                                  >
                                    <MoreVertical size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditingSchema(schema)}>
                                    <Settings size={16} className="mr-2" />
                                    Manage Schema
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleArchiveSchema(schema)}
                                    className={schema.isArchived ? "text-primary" : "text-muted-foreground"}
                                  >
                                    <Archive size={16} className="mr-2" />
                                    {schema.isArchived ? "Unarchive" : "Archive"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteSchema(schema)}
                                    className="text-destructive"
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredSchemas.length > 0 && (
                  <div className="p-4 border-t">
                    <PaginationControls
                      currentPage={currentSchemasPage}
                      totalPages={totalSchemaPages}
                      onPageChange={setCurrentSchemasPage}
                      itemsPerPage={schemasPerPage}
                      onItemsPerPageChange={setSchemasPerPage}
                      pageSizeOptions={[5, 10, 20, 50]}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <div className="rounded-md border bg-white">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {contentColumns.map((column, index) => (
                      <TableHead key={index} className={column.className}>
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContentItems.map((item) => (
                    <TableRow key={item.id}>
                      {contentColumns.map((column, index) => (
                        <TableCell key={index} className={column.className}>
                          {column.cell(item)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredContentItems.length > 0 && (
                <div className="p-4 border-t">
                  <PaginationControls
                    currentPage={currentContentPage}
                    totalPages={totalContentPages}
                    onPageChange={setCurrentContentPage}
                    itemsPerPage={contentItemsPerPage}
                    onItemsPerPageChange={setContentItemsPerPage}
                    pageSizeOptions={[5, 10, 20, 50]}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {schemaToDelete ? 
                `This will permanently delete the schema "${schemaToDelete.name}" and all its content.` :
                `This will permanently delete ${selectedSchemas.length} selected schema${selectedSchemas.length !== 1 ? 's' : ''} and all their content.`
              }
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setSchemaToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={schemaToDelete ? confirmDeleteSchema : handleArchiveSchemas}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContentSchemasPage;
