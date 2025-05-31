import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ContentItem, ContentSchema, ContentItemStatus } from "@/lib/contentSchema";
import { getContentItems, getSchemas, deleteContentItem, saveContentItem } from '@/lib/api/ContentApi';
import { FilterForm, FilterValues } from "@/components/Content/ContentList/FilterForm";
import { ContentListHeader } from "@/components/Content/ContentList/ContentListHeader";
import { DataTable, TableColumn } from "@/components/DataTable";
import { ContentPagination } from "@/components/Content/ContentList/ContentPagination";
import { getUniqueAuthors, paginateItems } from "@/components/Content/ContentList/utils";
import { SortSelect, SortOption } from "@/components/Content/ContentList/SortSelect";
import { ResultsBar } from "@/components/Content/ContentList/ResultsBar";
import { Loader2, Download, Trash2, EyeOff, Users, FileText, Calendar } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SelectionActionsBar } from "@/components/ui/SelectionActionsBar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadContent } from "@/lib/download";
import { ContentStatusBadge } from "@/components/Content/ContentList/ContentStatusBadge";
import { formatDate } from "@/utils/formatDate";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

// Content Table Configuration
const ContentTable: React.FC<{
  items: ContentItem[];
  schemas: ContentSchema[];
  onRowClick: (item: ContentItem) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onSelectionChange?: (selectedItems: ContentItem[]) => void;
}> = (props) => {
  const columns: TableColumn<ContentItem>[] = [
    {
      header: "Title",
      accessorKey: "title",
      width: "300px",
      cell: (item) => (
        <div className="flex items-center gap-2">
          {item.icon || <FileText size={16} className="text-muted-foreground" />}
          {item.title}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "schemaId",
      width: "120px",
      cell: (item) => {
        const schema = props.schemas.find(s => s.id === item.schemaId);
        return (
          <div className="flex items-center gap-2">
            {schema?.name || 'Unknown Schema'}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      width: "120px",
      cell: (item) => <ContentStatusBadge status={item.status} />,
    },
    {
      header: (
        <span className="flex items-center gap-2">
          <Calendar size={14} />
          Last Updated
        </span>
      ),
      accessorKey: "updatedAt",
      cell: (item) => formatDate(item.updatedAt),
    },
    {
      header: (
        <span className="flex items-center gap-2">
          <Calendar size={14} />
          Published
        </span>
      ),
      accessorKey: "publishedAt",
      cell: (item) => formatDate(item.publishedAt) || '-',
    },
    {
      header: (
        <span className="flex items-center gap-2">
          <Users size={14} />
          Authors
        </span>
      ),
      accessorKey: "authors",
      cell: (item) => {
        const authors = new Set([
          item.createdBy,
          item.updatedBy
        ].filter(Boolean));
        return authors.size > 0 ? Array.from(authors).map(author => author.split('@')[0]).join(', ') : '-';
      },
    },
  ];

  return (
    <DataTable
      {...props}
      columns={columns}
      getItemId={(item) => item.id}
      emptyMessage="No content items found."
    />
  );
};

type Author = {
  value: string;
  label: string;
};

const ContentManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [schemas, setSchemas] = useState<ContentSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>("title");
  const [selectedItems, setSelectedItems] = useState<ContentItem[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);
  const [newAuthors, setNewAuthors] = useState<Author[]>([]);
  const [isChangingAuthor, setIsChangingAuthor] = useState(false);
  const { currentWorkspace } = useWorkspace();
  
  const [filterValues, setFilterValues] = useState<FilterValues>({
    status: "",
    schemaId: "",
    author: "",
    search: "",
    page: 1,
    perPage: 10,
  });
  
  const [searchParams] = useSearchParams();
  const selectedSchemaId = searchParams.get('schema-id');
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentItems(currentWorkspace?.id);
        const schemaData = await getSchemas(currentWorkspace?.id);
        setAllItems(contentItems);
        setSchemas(schemaData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading your content.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentWorkspace) {
      loadData();
    }
  }, [currentWorkspace, toast]);
  
  // Parse and apply filters from URL query parameters
  useEffect(() => {
    // Skip if data isn't loaded yet
    if (isLoading || allItems.length === 0) return;
    
    const queryParams = new URLSearchParams(location.search);
    
    // Get and validate status from URL
    let status = queryParams.get("status") || "all";
    if (status !== "published" && status !== "draft" && status !== "pending_review" && status !== "all") {
      status = "all";
    }
    
    // Set up initial filters
    const initialFilters: FilterValues = {
      status: status,
      schemaId: queryParams.get("schema-id") || "all",
      author: queryParams.get("author") || "all",
      search: queryParams.get("search") || "",
      page: Number(queryParams.get("page")) || 1,
      perPage: Number(queryParams.get("perPage")) || 10,
    };
    
    // Handle sort parameter
    const sort = queryParams.get("sort") || "title";
    setSortField(sort);
    
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
    params.set("status", values.status || "all");
    params.set("schema-id", values.schemaId || "all");
    params.set("author", values.author || "all");
    if (values.search) params.set("search", values.search);
    if (sortField && sortField !== "title") params.set("sort", sortField);
    params.set("page", "1");
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
  
  const handleSelectionChange = (items: ContentItem[]) => {
    setSelectedItems(items);
  };
  
  const handleDownload = async (format: 'csv' | 'json' | 'jsonl') => {
    try {
      // Create loading toast
      toast({
        title: "Preparing download",
        description: "We're preparing your download, please wait...",
      });
      
      await downloadContent(selectedItems, format);
      
      toast({
        title: "Download complete",
        description: `Your ${format.toUpperCase()} download is ready.`,
      });
    } catch (error) {
      console.error("Error downloading content:", error);
      toast({
        title: "Download failed",
        description: error.message || "There was an error downloading your content. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      const ids = selectedItems.map(item => item.id);
      
      // Delete each item
      for (const id of ids) {
        await deleteContentItem(id);
      }
      
      // Update the items list
      setAllItems(prev => prev.filter(item => !ids.includes(item.id)));
      setItems(prev => prev.filter(item => !ids.includes(item.id)));
      setSelectedItems([]);
      setShowDeleteDialog(false);
      
      toast({
        title: "Items deleted",
        description: `Successfully deleted ${ids.length} item${ids.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error("Error deleting items:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the selected items. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUnpublish = async () => {
    try {
      const ids = selectedItems.map(item => item.id);
      const updatedItems = [...allItems];
      
      for (const id of ids) {
        const itemIndex = updatedItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            status: 'draft' as ContentItemStatus,
            updatedAt: new Date().toISOString(),
          };
          
          // Save to API
          await saveContentItem(updatedItems[itemIndex]);
        }
      }
      
      // Update the items list
      setAllItems(updatedItems);
      applyFilters(filterValues, sortField);
      setSelectedItems([]);
      
      toast({
        title: "Items unpublished",
        description: `Successfully unpublished ${ids.length} item${ids.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error("Error unpublishing items:", error);
      toast({
        title: "Unpublish failed",
        description: "There was an error unpublishing the selected items. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleChangeAuthor = async () => {
    try {
      if (newAuthors.length === 0) {
        toast({
          title: "No authors selected",
          description: "Please select at least one author to continue.",
          variant: "destructive",
        });
        return;
      }
      
      setIsChangingAuthor(true);
      const ids = selectedItems.map(item => item.id);
      const updatedItems = [...allItems];
      
      for (const id of ids) {
        const itemIndex = updatedItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          const updatedItem = {
            ...updatedItems[itemIndex],
            updatedBy: newAuthors[0].value, // Keep the first author as the main updater
            coAuthors: newAuthors.slice(1).map(author => author.value), // Store additional authors
            updatedAt: new Date().toISOString(),
          };
          updatedItems[itemIndex] = updatedItem;
          
          // Save to API
          await saveContentItem(updatedItem);
        }
      }
      
      // Update the items list and keep selection
      setAllItems(updatedItems);
      applyFilters(filterValues, sortField);
      setShowAuthorDialog(false);
      setNewAuthors([]);
      
      toast({
        title: "Authors updated",
        description: `Successfully updated authors for ${ids.length} item${ids.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error("Error changing authors:", error);
      toast({
        title: "Authors update failed",
        description: "There was an error updating the authors for the selected items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingAuthor(false);
    }
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
        
        {selectedItems.length === 0 ? (
          <ResultsBar
            totalItems={totalItems}
            sortField={sortField}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
          />
        ) : (
          <SelectionActionsBar
            selectedCount={selectedItems.length}
            actions={[
              {
                label: "Change Authors",
                icon: <Users size={16} />,
                onClick: () => setShowAuthorDialog(true),
              },
              {
                label: "Unpublish",
                icon: <EyeOff size={16} />,
                onClick: handleUnpublish,
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} />,
                onClick: () => setShowDeleteDialog(true),
              },
              {
                label: "Download",
                icon: <Download size={16} />,
                onClick: () => {},
                customButton: (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Download size={16} className="mr-2" />
                        Download
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleDownload('csv')}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload('json')}>
                        JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload('jsonl')}>
                        JSONL
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
          />
        )}
        
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
            onSelectionChange={setSelectedItems}
          />
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedItems.length} selected {selectedItems.length === 1 ? 'item' : 'items'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Change author dialog */}
      <Dialog open={showAuthorDialog} onOpenChange={setShowAuthorDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Change Authors</DialogTitle>
            <DialogDescription>
              Select new authors for the {selectedItems.length} selected {selectedItems.length === 1 ? 'item' : 'items'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <MultiSelect
              value={newAuthors}
              onChange={(selected) => setNewAuthors(selected as Author[])}
              options={uniqueAuthors.map(author => ({
                value: author,
                label: author.split('@')[0]
              }))}
              isMulti
              className="w-full"
              placeholder="Select authors..."
              noOptionsMessage={() => "No authors found"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuthorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeAuthor} disabled={isChangingAuthor}>
              {isChangingAuthor ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagerPage;
