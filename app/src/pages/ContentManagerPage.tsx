import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ContentItem, ContentSchema } from "@/lib/contentSchema";
import { ContentApi } from "@/lib/api";
import { FilterForm, FilterValues } from "@/components/Content/ContentList/FilterForm";
import { ContentListHeader } from "@/components/Content/ContentList/ContentListHeader";
import { ContentTable } from "@/components/Content/ContentList/ContentTable";
import { ContentPagination } from "@/components/Content/ContentList/ContentPagination";
import { getUniqueAuthors, paginateItems } from "@/components/Content/ContentList/utils";
import { SortSelect, SortOption } from "@/components/Content/ContentList/SortSelect";
import { ResultsBar } from "@/components/Content/ContentList/ResultsBar";
import { Loader2 } from "lucide-react";

const ContentManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [schemas, setSchemas] = useState<ContentSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>("title");
  const [filterValues, setFilterValues] = useState<FilterValues>({
    status: "",
    schemaId: "",
    author: "",
    search: "",
    page: 1,
    perPage: 10,
  });
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const contentItems = await ContentApi.getContentItems();
        const schemaData = await ContentApi.getSchemas();
        setAllItems(contentItems);
        setSchemas(schemaData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Parse and apply filters from URL query parameters
  useEffect(() => {
    // Skip if data isn't loaded yet
    if (isLoading || allItems.length === 0) return;
    
    const queryParams = new URLSearchParams(location.search);
    
    // Get and validate status from URL
    let status = queryParams.get("status") || "";
    if (status !== "published" && status !== "draft" && status !== "pending_review") {
      status = ""; // Empty string will be converted to "all" in the form
    }
    
    // Get schema and author
    const schemaId = queryParams.get("schema") || "";
    const author = queryParams.get("author") || "";
    
    // Set up initial filters
    const initialFilters: FilterValues = {
      status: status,
      schemaId: schemaId,
      author: author,
      search: queryParams.get("search") || "",
      page: Number(queryParams.get("page")) || 1,
      perPage: Number(queryParams.get("perPage")) || 10,
    };
    
    // Handle sort parameter
    const sort = queryParams.get("sort") || "title";
    setSortField(sort);
    
    console.log("Setting filter values from URL:", initialFilters);
    
    // Update state
    setFilterValues(initialFilters);
    setCurrentPage(initialFilters.page);
    setItemsPerPage(initialFilters.perPage || 10);
    
    // Apply the filters from URL
    applyFilters(initialFilters, sort);
  }, [location.search, isLoading, allItems]);
  
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const uniqueAuthors = getUniqueAuthors(allItems);
  const displayedItems = paginateItems(items, currentPage, itemsPerPage);
  
  const applyFilters = (values: FilterValues, sortBy?: string | null) => {
    let filteredItems = [...allItems];
    
    if (values.schemaId && values.schemaId !== "all") {
      filteredItems = filteredItems.filter(item => item.schemaId === values.schemaId);
    }
    
    // Only apply status filter if not "all"
    if (values.status && values.status !== "all") {
      filteredItems = filteredItems.filter(item => item.status === values.status);
    }
    
    // Fix author filtering to check both createdBy and updatedBy
    if (values.author && values.author !== "all") {
      filteredItems = filteredItems.filter(item => {
        const createdBy = item.createdBy || '';
        const updatedBy = item.updatedBy || '';
        return createdBy === values.author || updatedBy === values.author;
      });
    }
    
    // Fix search filtering to be case-insensitive
    if (values.search) {
      const searchTerm = values.search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting based on the sortBy field
    if (sortBy === 'updatedAt') {
      filteredItems.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ); 
    } else if (sortBy === 'createdAt') {
      filteredItems.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      // Default sort by title (alphabetically)
      filteredItems.sort((a, b) => 
        a.title.localeCompare(b.title)
      );
    }
    
    setItems(filteredItems);
    return filteredItems;
  };
  
  const onSubmitFilters = (values: FilterValues) => {
    setFilterValues(values);
    setItemsPerPage(values.perPage);
    applyFilters(values, sortField);
    setCurrentPage(1);
    
    // Update URL with filter parameters
    const params = new URLSearchParams();
    if (values.status) params.set("status", values.status);
    if (values.schemaId) params.set("schema", values.schemaId);
    if (values.author) params.set("author", values.author);
    if (values.search) params.set("search", values.search);
    if (sortField && sortField !== "title") params.set("sort", sortField);
    params.set("page", "1"); // Reset to page 1 when applying new filters
    params.set("perPage", values.perPage.toString());
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  const resetFilters = () => {
    const defaultValues: FilterValues = {
      status: "",
      schemaId: "",
      author: "",
      search: "",
      page: 1,
      perPage: 10,
    };
    
    setFilterValues(defaultValues);
    setSortField("title");
    setItems(allItems);
    setCurrentPage(1);
    setItemsPerPage(10);
    
    // Clear URL parameters
    navigate(location.pathname);
  };
  
  const handleRowClick = (item: ContentItem) => {
    navigate(`/manager/editor/${item.schemaId}/${item.id}`);
  };
  
  const handleCreateNew = (schemaId: string) => {
    navigate(`/manager/editor/${schemaId}/new`);
  };
  
  const handleSortChange = (value: string) => {
    setSortField(value);
    
    // Apply the sort to the current items
    applyFilters(filterValues, value);
    
    // Update URL with the new sort parameter
    const params = new URLSearchParams(location.search);
    if (value && value !== "title") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  const sortOptions: SortOption[] = [
    { value: "title", label: "Title (A-Z)" },
    { value: "updatedAt", label: "Last Updated" },
    { value: "createdAt", label: "Date Created" },
  ];
  
  return (
    <div className="space-y-6">
      <ContentListHeader 
        handleCreateNew={handleCreateNew}
        schemas={schemas} 
      />
      
      <div className="rounded-md border bg-white">
        <div className="px-3 py-3 bg-muted/20">
          <FilterForm
            onSubmitFilters={onSubmitFilters}
            resetFilters={resetFilters}
            schemas={schemas}
            uniqueAuthors={uniqueAuthors}
            initialValues={filterValues}
          />
        </div>
        
        <ResultsBar
          totalItems={totalItems}
          sortField={sortField}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
        />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p className="text-lg">Loading content...</p>
          </div>
        ) : (
          <ContentTable 
            items={displayedItems}
            schemas={schemas}
            onRowClick={handleRowClick}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>
    </div>
  );
};

export default ContentManagerPage;
