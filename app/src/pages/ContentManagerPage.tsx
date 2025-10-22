import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ContentItem, ContentItemStatus } from "@/lib/api/SchemaApi";
import * as ContentApiMod from '@/lib/api/ContentApi';
import * as SchemaApiMod from '@/lib/api/SchemaApi';
import type { ContentSchemaRow } from '@/lib/api/SchemaApi';
import { FilterForm, FilterValues } from "@/components/Content/ContentList/FilterForm";
import { ContentListHeader } from "@/components/Content/ContentList/ContentListHeader";
import { DataTable, TableColumn } from "@/components/DataTable";
import { SortOption } from "@/components/Content/ContentList/SortSelect";
import { ResultsBar } from "@/components/Content/ContentList/ResultsBar";
import * as Icons from "@/components/ui/icons";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { notifyError } from "@/lib/errors";
import { SelectionActionsBar } from "@/components/ui/SelectionActionsBar";
import { formatDate } from "@/utils/date";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
// Removed css-constants abstraction; use Tailwind utilities directly
// Note: For this page, we fetch data directly to align with tests that mock API modules and SWR.
import type { ContentItemRow } from '@/lib/api/ContentApi';


// Content Table Configuration
type ContentTableProps = {
  items: ContentItemRow[];
  schemas: ContentSchemaRow[];
  onRowClick: (item: ContentItemRow) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onSelectionChange?: (selectedItems: ContentItemRow[]) => void;
};

const ContentTable = (props: ContentTableProps) => {
  const columns: TableColumn<ContentItemRow>[] = React.useMemo(() => [
    {
      header: "Title",
      accessorKey: "title",
      width: "300px",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Icons.FileText size={16} className="text-muted-foreground" />
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
        <span className="flex-center-gap-2">
          <Icons.Calendar size={14} />
          Last Updated
        </span>
      ),
      accessorKey: "updated_at",
      cell: (item) => formatDate(item.updated_at),
    },
  ], [props.schemas]);

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

const ContentManagerPage = () => {
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
  
  // Data state consolidated
  const [dataState, setDataState] = useState({
    allItems: [] as ContentItemRow[],
    schemas: [] as ContentSchemaRow[],
    loading: { content: false, schemas: false },
  });

  // Use ContentSchemaRow directly
  const { convertedSchemas, activeSchemas } = useMemo(() => {
    const active = dataState.schemas.filter(s => !s.archived_at);
    return { convertedSchemas: dataState.schemas, activeSchemas: active };
  }, [dataState.schemas]);

  const isLoading = dataState.loading.content || dataState.loading.schemas;
  
  const [filterValues, setFilterValues] = useState<FilterValues>({
    schemaId: "all",
    search: "",
    page: 1,
    perPage: 10,
  });
  
  // Custom hook for data management
  const loadData = useCallback(async (schemaFilter?: string) => {
    if (!currentWorkspace) return;

    setDataState(prev => ({
      ...prev,
      loading: { content: true, schemas: true },
    }));

    const loadContent = async () => {
      try {
        const options: ContentApiMod.ListContentItemsOptions = {};
        
        // Only add schemaIds if filtering by specific schema
        if (schemaFilter && schemaFilter !== "all") {
          const schemaId = parseInt(schemaFilter);
          if (!isNaN(schemaId)) {
            options.schemaIds = [schemaId];
          }
        }

        const res = await ContentApiMod.listContentItems(currentWorkspace.id, options);
        return res.data ?? [];
      } catch (error) {
        notifyError(toast, error, {
          title: "Error loading content",
          fallback: "There was a problem loading your content.",
          prefix: "Error loading content",
        });
        throw error;
      }
    };

    const loadSchemas = async () => {
      try {
        const res = await SchemaApiMod.listSchemas(currentWorkspace.id);
        return res.data ?? [];
      } catch (error) {
        notifyError(toast, error, {
          title: "Error loading schemas",
          fallback: "There was a problem loading your schemas.",
          prefix: "Error loading schemas",
        });
        throw error;
      }
    };

    const [contentResult, schemasResult] = await Promise.allSettled([
      loadContent(),
      loadSchemas()
    ]);

    setDataState(prev => ({
      ...prev,
      allItems: contentResult.status === 'fulfilled' ? contentResult.value : prev.allItems,
      schemas: schemasResult.status === 'fulfilled' ? schemasResult.value : prev.schemas,
      loading: { content: false, schemas: false },
    }));
  }, [currentWorkspace, toast]);

  useEffect(() => {
    loadData(filterValues.schemaId);
  }, [loadData, filterValues.schemaId]);
  
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
  
  
  const handleDelete = async () => {
    try {
      const ids = selectedItems.map(item => item.id);
      
      // Delete each item
      for (const id of ids) {
        await ContentApiMod.deleteContentItem(id, currentWorkspace!.id);
      }
      
      // Mutate SWR cache to refresh data
      // Refresh content after delete
      loadData(filterValues.schemaId);
      setSelectedItems([]);
      setShowDeleteDialog(false);
      
      toast({
        title: "Items deleted",
        description: `Successfully deleted ${ids.length} item${ids.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      notifyError(toast, error, {
        title: "Delete failed",
        fallback: "There was an error deleting the selected items. Please try again.",
        prefix: "Delete failed",
      });
    }
  };
  
  const handleUnpublish = async () => {
    if (!currentWorkspace) return;
    
    try {
      const ids = selectedItems.map(item => item.id);

      for (const id of ids) {
        const item = dataState.allItems.find(item => item.id === id);
        if (item) {
          // Save to API - unpublish by setting published_at to null
          await ContentApiMod.updateContentItem(item.id!, {
            published_at: null,
          }, currentWorkspace.id);
        }
      }
      
      // Mutate SWR cache to refresh data
      // Refresh content after update
      loadData(filterValues.schemaId);
      setSelectedItems([]);
      
      toast({
        title: "Items unpublished",
        description: `Successfully unpublished ${ids.length} item${ids.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      notifyError(toast, error, {
        title: "Unpublish failed",
        fallback: "There was an error unpublishing the selected items. Please try again.",
        prefix: "Unpublish failed",
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
  
  const sortOptions: SortOption[] = React.useMemo(() => ([
    { value: "title", label: "Title (A-Z)" },
    { value: "updatedAt", label: "Last Updated" },
    { value: "createdAt", label: "Date Created" },
  ]), []);
  
  return (
    <div className="space-y-6">
      <ContentListHeader
        handleCreateNew={handleCreateNew}
        schemas={activeSchemas}
      />
      
      <div className={`rounded-md border bg-white`}>
        <div className={`px-3 py-3 bg-muted/20`}>
          <FilterForm
            onSubmitFilters={onSubmitFilters}
            resetFilters={resetFilters}
            schemas={convertedSchemas}
            initialValues={filterValues}
          />
        </div>
        
        {selectedItems.length === 0 ? (
          <ResultsBar
            totalItems={dataState.allItems.length}
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
                icon: <Icons.Users size={16} />,
                onClick: () => setShowAuthorDialog(true),
              },
              {
                label: "Unpublish",
                icon: <Icons.EyeOff size={16} />,
                onClick: handleUnpublish,
              },
              {
                label: "Delete",
                icon: <Icons.Trash2 size={16} />,
                onClick: () => setShowDeleteDialog(true),
              },
            ]}
          />
        )}
        
        {isLoading ? (
          <div className="flex-center-justify py-16">
            <Icons.Loader2 className={`icon-lg animate-spin text-primary mr-2`} />
            <p className="text-lg">Loading content...</p>
          </div>
        ) : (
          <ContentTable
            items={dataState.allItems}
            schemas={dataState.schemas}
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
                  <Icons.Loader2 className="mr-2 icon-sm animate-spin" />
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
