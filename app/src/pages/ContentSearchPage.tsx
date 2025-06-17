import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, List, Grid, Tag, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ContentItem, ContentItemStatus } from "@/lib/contentSchema";
import { useSearch } from "@/contexts/SearchContext";
import { mockContentItems, contentSchemas } from "@/lib/mocks";
import { PaginationControls } from "@/components/Content/ContentList/PaginationControls";

const ContentSearchPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSearchQuery } = useSearch();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [availableSchemas, setAvailableSchemas] = useState<Array<{id: string, name: string}>>([]);
  const [selectedSchemas, setSelectedSchemas] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ContentItemStatus[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  useEffect(() => {
    if (!initialQuery) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      // Filter mockContentItems based on search query
      const results = mockContentItems.filter(item => 
        item.title.toLowerCase().includes(initialQuery.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(initialQuery.toLowerCase())))
      );
      
      setSearchResults(results);
      
      // Extract unique schema types from results
      const schemaIds = [...new Set(results.map(item => item.schemaId))];
      // Create schema objects with names for display
      const schemas = schemaIds.map(id => {
        const schema = contentSchemas.find(s => s.id === id);
        return schema || { id, name: id.charAt(0).toUpperCase() + id.slice(1) };
      });
      setAvailableSchemas(schemas);
      
      setIsLoading(false);
    }, 1000);
  }, [initialQuery]);
  
  const applyFilters = () => {
    setIsLoading(true);
    setFiltersApplied(true);
    
    setTimeout(() => {
      const filtered = searchResults.filter(item => 
        (selectedSchemas.length === 0 || selectedSchemas.includes(item.schemaId)) &&
        (selectedStatuses.length === 0 || selectedStatuses.includes(item.status))
      );
      
      setSearchResults(filtered);
      setIsLoading(false);
      
      toast({
        title: "Filters applied",
        description: `Found ${filtered.length} items matching your criteria`
      });
    }, 800);
  };

  const clearFiltersAndSearch = () => {
    // Reset filters
    setSelectedSchemas([]);
    setSelectedStatuses([]);
    setFiltersApplied(false);
    
    // Clear search query in header
    setSearchQuery("");
    
    // Navigate to empty search page
    navigate("/search");
    
    toast({
      title: "Filters cleared",
      description: "All filters and search criteria have been reset"
    });
  };
  
  const handleSchemaChange = (schemaId: string) => {
    setSelectedSchemas(prev => 
      prev.includes(schemaId) 
        ? prev.filter(t => t !== schemaId) 
        : [...prev, schemaId]
    );
  };
  
  const handleStatusChange = (status: ContentItemStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get content fields (supporting both data and content)
  const getContentField = (item: ContentItem, field: string) => {
    if (item.data && item.data[field] !== undefined) {
      return item.data[field];
    }
    if (item.content && item.content[field] !== undefined) {
      return item.content[field];
    }
    return undefined;
  };

  // Helper to get the last updated date, regardless of source
  const getLastUpdated = (item: ContentItem) => {
    return item.lastUpdated || item.updatedAt;
  };

  // Get paginated results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchResults.slice(startIndex, endIndex);
  }, [searchResults, currentPage, itemsPerPage]);

  useEffect(() => {
    // Reset to first page when search results change
    setCurrentPage(1);
  }, [searchResults.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        {initialQuery && (
          <p className="text-muted-foreground">
            Results for: <span className="font-medium text-foreground">"{initialQuery}"</span>
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <span>Filters</span>
                </div>
                {filtersApplied && (selectedSchemas.length > 0 || selectedStatuses.length > 0) && (
                  <Button 
                    onClick={clearFiltersAndSearch} 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-auto py-1 px-2"
                  >
                    Clear
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Content Schema</h3>
                
                <div className="space-y-1.5">
                  {availableSchemas.map(schema => (
                    <div key={schema.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`schema-${schema.id}`} 
                        checked={selectedSchemas.includes(schema.id)}
                        onCheckedChange={() => handleSchemaChange(schema.id)}
                      />
                      <Label htmlFor={`schema-${schema.id}`}>{schema.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Status</h3>
                
                <div className="space-y-1.5">
                  {(['published', 'draft', 'pending_review'] as ContentItemStatus[]).map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`status-${status}`} 
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={() => handleStatusChange(status)}
                      />
                      <Label htmlFor={`status-${status}`} className="capitalize">
                        {status === 'pending_review' ? 'Pending Review' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  {isLoading 
                    ? "Searching..." 
                    : searchResults.length === 0 
                      ? "No results found" 
                      : `Found ${searchResults.length} results for "${initialQuery}"`}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sort-by" className="text-sm whitespace-nowrap">Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort-by" className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border rounded-md flex">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List size={16} />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 text-center text-muted-foreground">Loading results...</div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No results match your search criteria</p>
                  <Button className="mt-4" variant="outline" onClick={clearFiltersAndSearch}>Clear Filters</Button>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                  {paginatedResults.map((item) => (
                    <div 
                      key={item.id}
                      className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        viewMode === "list" ? "flex items-start space-x-4" : ""
                      }`}
                      onClick={() => navigate(`/manager/${item.schemaId}/${item.id}`)}
                    >
                      {viewMode === "list" && (
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md bg-primary/10">
                          {item.schemaId === "blog-post" && <Search size={20} className="text-primary" />}
                          {item.schemaId === "product-catalog" && <Tag size={20} className="text-primary" />}
                          {item.schemaId === "page-builder" && <List size={20} className="text-primary" />}
                        </div>
                      )}
                      
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-medium ${viewMode === "grid" ? "mt-2" : ""}`}>{item.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 capitalize">{item.schemaId}</p>
                          </div>
                          <Badge 
                            variant={
                              item.status === "published" ? "default" : 
                              item.status === "draft" ? "secondary" : "outline"
                            }
                            className="capitalize"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags && item.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {!item.tags && getContentField(item, 'tags') && 
                            getContentField(item, 'tags').map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          }
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {item.author && (
                              <>
                                <img 
                                  src={item.author.avatar} 
                                  alt={item.author.name}
                                  className="w-5 h-5 rounded-full"
                                />
                                <span>{item.author.name}</span>
                              </>
                            )}
                            {!item.author && item.updatedBy && (
                              <span>{item.updatedBy}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatDate(getLastUpdated(item))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {searchResults.length > 0 && (
              <div className="px-4 py-2">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={Math.ceil(searchResults.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentSearchPage;
