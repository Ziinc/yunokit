import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, FileText, Search, Files, File, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ContentSchemaEditor } from "@/components/Content/ContentSchemaEditor";
import { ContentSchema, exampleSchemas, ContentItem } from "@/lib/contentSchema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs,  TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationControls } from "@/components/Content/ContentList/PaginationControls";
import { DocsButton } from "@/components/ui/DocsButton";

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

const ContentSchemaBuilderPage: React.FC = () => {
  const [schemas, setSchemas] = useState<ContentSchema[]>(exampleSchemas);
  const [editingSchema, setEditingSchema] = useState<ContentSchema | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [schemaTypeFilter, setSchemaTypeFilter] = useState<"all" | "collection" | "single">("all");
  const [schemasPerPage, setSchemasPerPage] = useState(10);
  const [currentSchemasPage, setCurrentSchemasPage] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter schemas based on type filter and search query
  const filteredSchemas = useMemo(() => {
    // First filter by type
    const filtered = schemas.filter(schema => {
      if (schemaTypeFilter === "all") return true;
      if (schemaTypeFilter === "collection") return schema.isCollection;
      if (schemaTypeFilter === "single") return !schema.isCollection;
      return true;
    });
    
    // Then apply search filter (across name and description)
    if (!searchQuery.trim()) return filtered;
    
    const searchLower = searchQuery.toLowerCase();
    return filtered.filter(schema => 
      schema.name.toLowerCase().includes(searchLower) ||
      (schema.description && schema.description.toLowerCase().includes(searchLower))
    );
  }, [schemas, schemaTypeFilter, searchQuery]);

  // Get paginated schemas
  const paginatedSchemas = useMemo(() => {
    const startIndex = (currentSchemasPage - 1) * schemasPerPage;
    const endIndex = startIndex + schemasPerPage;
    return filteredSchemas.slice(startIndex, endIndex);
  }, [filteredSchemas, currentSchemasPage, schemasPerPage]);

  // Total pages for schemas
  const totalSchemaPages = Math.ceil(filteredSchemas.length / schemasPerPage);

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

  // Navigate to Content Manager with schema filter
  const handleViewContent = (schemaId: string) => {
    navigate(`/manager?schema=${schemaId}`);
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
      
      {/* Search and filter in the same row */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search schemas by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs 
          value={schemaTypeFilter} 
          onValueChange={(v) => setSchemaTypeFilter(v as "all" | "collection" | "single")}
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
      
      {/* Schema list with white background */}
      <div className="overflow-hidden border rounded-md bg-white">
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
              {paginatedSchemas.map((schema) => (
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
                        onClick={() => handleViewContent(schema.id)}
                      >
                        <FileText size={16} className="mr-2" />
                        View Content
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
  );
};

export default ContentSchemaBuilderPage;
