import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, List, Grid, Calendar, Tag, Clock, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ContentItemStatus } from "@/lib/contentSchema";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  schema: string;
  status: ContentItemStatus;
  lastUpdated: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
}

const ContentSearchPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ContentItemStatus[]>(["published", "draft"]);
  
  const contentSchemas = [
    { id: "article", name: "Article" },
    { id: "product", name: "Product" },
    { id: "page", name: "Page" },
    { id: "blog", name: "Blog Post" },
    { id: "tutorial", name: "Tutorial" }
  ];
  
  useEffect(() => {
    if (!initialQuery) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const results: ContentItem[] = [
        {
          id: "1",
          title: "Getting Started with SupaContent",
          type: "article",
          schema: "tutorial",
          status: "published" as ContentItemStatus,
          lastUpdated: "2023-09-15T10:30:00Z",
          tags: ["tutorial", "beginners", "cms"],
          author: {
            name: "John Smith",
            avatar: "/placeholder.svg"
          }
        },
        {
          id: "2",
          title: "Advanced Content Modeling",
          type: "article",
          schema: "tutorial",
          status: "published" as ContentItemStatus,
          lastUpdated: "2023-09-10T14:15:00Z",
          tags: ["content-modeling", "advanced", "cms"],
          author: {
            name: "Jane Doe",
            avatar: "/placeholder.svg"
          }
        },
        {
          id: "3",
          title: "Summer Collection 2023",
          type: "collection",
          schema: "product",
          status: "published" as ContentItemStatus,
          lastUpdated: "2023-08-20T09:45:00Z",
          tags: ["summer", "collection", "fashion"],
          author: {
            name: "Mike Wilson",
            avatar: "/placeholder.svg"
          }
        },
        {
          id: "4",
          title: "Privacy Policy Page",
          type: "page",
          schema: "page",
          status: "published" as ContentItemStatus,
          lastUpdated: "2023-07-05T11:30:00Z",
          tags: ["legal", "policy"],
          author: {
            name: "Legal Team",
            avatar: "/placeholder.svg"
          }
        },
        {
          id: "5",
          title: "New Product Launch Plan",
          type: "document",
          schema: "article",
          status: "draft" as ContentItemStatus,
          lastUpdated: "2023-09-18T16:20:00Z",
          tags: ["product-launch", "marketing", "planning"],
          author: {
            name: "Marketing Team",
            avatar: "/placeholder.svg"
          }
        }
      ].filter(item => 
        item.title.toLowerCase().includes(initialQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(initialQuery.toLowerCase()))
      );
      
      setSearchResults(results);
      
      const types = [...new Set(results.map(item => item.schema))];
      setContentTypes(types);
      
      setIsLoading(false);
    }, 1000);
  }, [initialQuery]);
  
  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    
    setIsLoading(true);
    
    setTimeout(() => {
      const filtered = searchResults.filter(item => 
        (selectedTypes.length === 0 || selectedTypes.includes(item.schema)) &&
        selectedStatuses.includes(item.status)
      );
      
      setSearchResults(filtered);
      setIsLoading(false);
      
      toast({
        title: "Search results updated",
        description: `Found ${filtered.length} items matching your criteria`
      });
    }, 800);
  };
  
  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content..." 
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter size={18} />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Content Type</h3>
                
                <div className="space-y-2">
                  {contentSchemas.map(schema => (
                    <div key={schema.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`type-${schema.id}`} 
                        checked={selectedTypes.includes(schema.id)}
                        onCheckedChange={() => handleTypeChange(schema.id)}
                      />
                      <Label htmlFor={`type-${schema.id}`}>{schema.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Status</h3>
                
                <div className="space-y-2">
                  {(['published', 'draft', 'pending_review'] as ContentItemStatus[]).map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`status-${status}`} 
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={() => handleStatusChange(status)}
                      />
                      <Label htmlFor={`status-${status}`} className="capitalize">{status}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <Button onClick={handleSearch} className="w-full">Apply Filters</Button>
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
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
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
                  <Button className="mt-4" variant="outline" onClick={() => {
                    setSelectedTypes([]);
                    setSelectedStatuses(["published", "draft"]);
                    navigate("/search");
                  }}>Clear Filters</Button>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                  {searchResults.map((item) => (
                    <div 
                      key={item.id}
                      className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        viewMode === "list" ? "flex items-start space-x-4" : ""
                      }`}
                      onClick={() => navigate(`/content/${item.schema}/${item.id}`)}
                    >
                      {viewMode === "list" && (
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md bg-primary/10">
                          {item.schema === "article" && <Search size={20} className="text-primary" />}
                          {item.schema === "product" && <Tag size={20} className="text-primary" />}
                          {item.schema === "page" && <List size={20} className="text-primary" />}
                          {item.schema === "tutorial" && <Calendar size={20} className="text-primary" />}
                        </div>
                      )}
                      
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-medium ${viewMode === "grid" ? "mt-2" : ""}`}>{item.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 capitalize">{item.schema}</p>
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
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <img 
                              src={item.author.avatar} 
                              alt={item.author.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{item.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatDate(item.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentSearchPage;
