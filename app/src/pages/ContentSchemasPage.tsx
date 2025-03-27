
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, FileText, Edit, Search, Files, File, Layers } from "lucide-react";
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
      const contentMatches = JSON.stringify(item.content).toLowerCase().includes(searchLower);
      
      if (!titleMatches && !contentMatches) return false;
    }
    
    return true;
  });
};

const ContentSchemasPage: React.FC = () => {
  const [schemas, setSchemas] = useState<ContentSchema[]>(exampleSchemas);
  const [editingSchema, setEditingSchema] = useState<ContentSchema | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"schemas" | "content">("schemas");
  const [schemaTypeFilter, setSchemaTypeFilter] = useState<"all" | "collection" | "single">("all");
  const { toast } = useToast();
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your content schemas and content items
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
          
          <div className="overflow-hidden border rounded-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchemas.map((schema) => (
                    <TableRow key={schema.id}>
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={() => setEditingSchema(schema)}
                              >
                                <Settings size={16} className="mr-2" />
                                Manage Schema
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              {editingSchema && (
                                <ContentSchemaEditor
                                  initialSchema={editingSchema}
                                  onSave={handleUpdateSchema}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="h-[600px]">
              <div className="min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContentItems.map((item) => {
                      const schema = schemas.find(s => s.id === item.schemaId);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{schema?.name || item.schemaId}</TableCell>
                          <TableCell>{renderStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {item.createdBy?.split('@')[0] || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditContent(item.schemaId, item.id)}
                            >
                              <Edit size={16} className="mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentSchemasPage;
