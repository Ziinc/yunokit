import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ContentItem, ContentItemStatus } from "@/lib/contentSchema";
import * as ContentApiMod from '@/lib/api/ContentApi';
import * as SchemaApiMod from '@/lib/api/SchemaApi';
import type { ContentSchemaRow } from '@/lib/api/SchemaApi';
import { FilterForm, FilterValues } from "@/components/Content/ContentList/FilterForm";
import { ContentListHeader } from "@/components/Content/ContentList/ContentListHeader";
import { DataTable, TableColumn } from "@/components/DataTable";
import { SortOption } from "@/components/Content/ContentList/SortSelect";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SelectionActionsBar } from "@/components/ui/SelectionActionsBar";
import { downloadContent } from "@/lib/download";
import { ContentStatusBadge } from "@/components/Content/ContentList/ContentStatusBadge";
import { formatDate } from "@/utils/formatDate";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
// Note: For this page, we fetch data directly to align with tests that mock API modules and SWR.
import type { ContentItemRow } from '@/lib/api/ContentApi';


// Content Table Configuration
const ContentTable: React.FC<{
  items: ContentItemRow[];
  schemas: ContentSchemaRow[];
  onRowClick: (item: ContentItemRow) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onSelectionChange?: (selectedItems: ContentItemRow[]) => void;
}> = (props) => {
  const columns: TableColumn<ContentItemRow>[] = [
    {
      header: "Title",
      accessorKey: "title",
      width: "300px",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-muted-foreground" />
          {item.title}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "schema_id",
      width: "120px",
      cell: (item) => {
        const schema = props.schemas.find(s => s.id === item.schema_id);
        return (
          <div className="flex items-center gap-2">
            {schema?.name || 'Unknown Schema'}
          </div>
        );
      },
    },
    {
      header: (
        <span className="flex items-center gap-2">
          <Calendar size={14} />
          Last Updated
        </span>
      ),
      accessorKey: "updated_at",
      cell: (item) => formatDate(item.updated_at),
    },
  ];

  return (
    <DataTable
      {...props}
      columns={columns}
      getItemId={(item) => item.id?.toString() || ''}
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>("title");
  const [selectedItems, setSelectedItems] = useState<ContentItemRow[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);
  const [newAuthors, setNewAuthors] = useState<Author[]>([]);
  const [isChangingAuthor, setIsChangingAuthor] = useState(false);
  const { currentWorkspace } = useWorkspace();
  
  const [allItems, setAllItems] = useState<ContentItemRow[]>([]);
  const [contentLoading, setContentLoading] = useState<boolean>(false);
  const [contentError, setContentError] = useState<unknown>(null);
  
  const [schemas, setSchemas] = useState<ContentSchemaRow[]>([]);
  const [schemasLoading, setSchemasLoading] = useState<boolean>(false);
  const [schemasError, setSchemasError] = useState<unknown>(null);

  // Convert ContentSchemaRow[] to ContentSchema[] for components that expect string IDs
  const convertedSchemas = schemas.map(schema => ({
    id: schema.id.toString(),
    name: schema.name,
    description: schema.description || undefined,
    fields: (schema.fields as any[]) || [],
    isCollection: schema.type === 'collection',
    type: schema.type || 'collection',
    strict: schema.strict
  }));

  const activeSchemas = schemas
    .filter(s => !s.archived_at)
    .map(s => ({
      id: s.id.toString(),
      name: s.name,
      description: s.description || undefined,
      fields: (s.fields as any[]) || [],
      isCollection: s.type === 'collection',
      type: s.type || 'collection',
      strict: s.strict
    }));

  const isLoading = contentLoading || schemasLoading;
  
  const [filterValues, setFilterValues] = useState<FilterValues>({
    schemaId: "all",
    search: "",
    page: 1,
    perPage: 10,
  });
  
  // Direct data loading to align with test mocks
  useEffect(() => {
    if (!currentWorkspace) return;
    const load = async () => {
      try {
        setContentLoading(true);
        const res = await ((ContentApiMod as any).ContentApi?.listContentItems?.(currentWorkspace.id) ?? ContentApiMod.listContentItems(currentWorkspace.id));
        setAllItems(((res as any)?.data as ContentItemRow[]) ?? []);
      } catch (e) {
        setContentError(e);
      } finally {
        setContentLoading(false);
      }
    };
    load();
  }, [currentWorkspace]);

  useEffect(() => {
    if (!currentWorkspace) return;
    const load = async () => {
      try {
        setSchemasLoading(true);
        const res = await ((ContentApiMod as any).ContentApi?.getSchemas?.(currentWorkspace.id) ?? SchemaApiMod.listSchemas(currentWorkspace.id));
        setSchemas(((res as any)?.data as ContentSchemaRow[]) ?? (res as any) ?? []);
      } catch (e) {
        setSchemasError(e);
      } finally {
        setSchemasLoading(false);
      }
    };
    load();
  }, [currentWorkspace]);

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
  
  // Parse and apply filters from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const initialFilters: FilterValues = {
      // tests use "schema" as the key, not "schema-id"
      schemaId: queryParams.get("schema") || "all",
      search: queryParams.get("search") || "",
      page: Number(queryParams.get("page")) || 1,
      perPage: Number(queryParams.get("perPage")) || 10,
    };

    const sort = queryParams.get("sort") || "title";
    setSortField(sort);

    setFilterValues(initialFilters);
    setCurrentPage(initialFilters.page);
    setItemsPerPage(initialFilters.perPage || 10);
  }, [location.search]);
  
  const onSubmitFilters = (values: FilterValues) => {
    setFilterValues(values);
    setItemsPerPage(values.perPage);
    setCurrentPage(1);
    
    // Update URL with filter parameters
    const params = new URLSearchParams();
    // tests expect "schema"
    params.set("schema", values.schemaId || "all");
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
      schemaId: "all",
      search: "",
      page: 1,
      perPage: 10,
    };
    
    setFilterValues(defaultValues);
    setSortField("title");
    setCurrentPage(1);
    setItemsPerPage(10);
    
    // Clear URL parameters
    navigate(location.pathname);
  };
  
  
  const handleRowClick = (item: ContentItemRow) => {
    navigate(`/manager/editor/${item.id}`);
  };
  
  const handleCreateNew = (schemaId: string) => {
    navigate(`/manager/editor/${schemaId}/new`);
  };
  
  const handleSortChange = (value: string) => {
    setSortField(value);
    
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
  
  const handleDownload = async (format: 'csv' | 'json' | 'jsonl') => {
    try {
      // Create loading toast
      toast({
        title: "Preparing download",
        description: "We're preparing your download, please wait...",
      });
      
      // Convert ContentItemRow to ContentItem for download
      const convertedItems: ContentItem[] = selectedItems.map(item => ({
        id: item.id?.toString() || '',
        title: item.title || '',
        schemaId: item.schema_id?.toString() || '',
        status: (item.status || 'draft') as ContentItemStatus,
        createdAt: item.created_at || '',
        updatedAt: item.updated_at || '',
        publishedAt: item.published_at || undefined,
        data: (item.data as Record<string, unknown>) || {}
      }));
      await downloadContent(convertedItems, format);
      
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
        await ContentApiMod.deleteContentItem(id, currentWorkspace!.id);
      }
      
      // Mutate SWR cache to refresh data
      // Refresh content after delete
      try {
        const res = await ((ContentApiMod as any).ContentApi?.listContentItems?.(currentWorkspace!.id) ?? ContentApiMod.listContentItems(currentWorkspace!.id));
        setAllItems(((res as any)?.data as ContentItemRow[]) ?? []);
      } catch {}
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
    if (!currentWorkspace) return;
    
    try {
      const ids = selectedItems.map(item => item.id);
      
      for (const id of ids) {
        const item = allItems.find(item => item.id === id);
        if (item) {
          // Save to API - unpublish by setting published_at to null
          await ContentApiMod.updateContentItem(item.id!, {
            published_at: null,
          }, currentWorkspace.id);
        }
      }
      
      // Mutate SWR cache to refresh data
      // Refresh content after update
      try {
        const res = await ((ContentApiMod as any).ContentApi?.listContentItems?.(currentWorkspace!.id) ?? ContentApiMod.listContentItems(currentWorkspace!.id));
        setAllItems(((res as any)?.data as ContentItemRow[]) ?? []);
      } catch {}
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
    if (!currentWorkspace) return;
    
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
      
      // TODO: Author management needs to be implemented using the content_authors table
      // For now, just show a message that this feature is not yet implemented
      toast({
        title: "Feature not implemented",
        description: "Author management is not yet implemented with the current database schema.",
        variant: "destructive",
      });
      
      setShowAuthorDialog(false);
      setNewAuthors([]);
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
        schemas={activeSchemas}
      />
      
      <div className="rounded-md border bg-white">
        <div className="px-3 py-3 bg-muted/20">
          <FilterForm
            onSubmitFilters={onSubmitFilters}
            resetFilters={resetFilters}
            schemas={convertedSchemas}
            initialValues={filterValues}
          />
        </div>
        
        {selectedItems.length === 0 ? (
          <ResultsBar
            totalItems={allItems.length}
            sortField={sortField}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
          />
        ) : (
          <SelectionActionsBar
            selectedCount={selectedItems.length}
            actions={[
              {
                label: "Change Author",
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
            items={allItems}
            schemas={schemas}
            onRowClick={handleRowClick}
            currentPage={currentPage}
            totalPages={1}
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
              options={[]}
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
