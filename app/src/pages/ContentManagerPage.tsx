import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  listContentItems,
  listContentItemsBySchema,
  deleteContentItem,
} from "@/lib/api/ContentApi";
import { listSchemas, getSchema } from "@/lib/api/SchemaApi";
import type { ContentSchemaRow } from "@/lib/api/SchemaApi";
import {
  FilterForm,
  FilterValues,
} from "@/components/Content/ContentList/FilterForm";
import { ContentListHeader } from "@/components/Content/ContentList/ContentListHeader";
import { DataTable, TableColumn } from "@/components/DataTable";
import { SortOption } from "@/components/Content/ContentList/SortSelect";
import { ResultsBar } from "@/components/Content/ContentList/ResultsBar";
import * as Icons from "@/components/ui/icons";
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
import { useToast } from "@/hooks/use-toast";
import { notifyError } from "@/lib/errors";
import { SelectionActionsBar } from "@/components/ui/SelectionActionsBar";
import { formatDate } from "@/utils/date";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import type { ContentItemRow } from "@/lib/api/ContentApi";
import useSWR from "swr";

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
  const columns: TableColumn<ContentItemRow>[] = React.useMemo(
    () => [
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
          const schema = props.schemas.find((s) => s.id === item.schema_id);
          return (
            <div className="flex items-center gap-2">
              {schema?.name || "Unknown Schema"}
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
    ],
    [props.schemas]
  );

  return (
    <DataTable
      {...props}
      columns={columns}
      getItemId={(item) => item.id?.toString() || ""}
      emptyMessage="No content items found."
    />
  );
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
  const { currentWorkspace } = useWorkspace();

  const [filterValues, setFilterValues] = useState<FilterValues>({
    schemaId: "all",
    search: "",
  });

  const {
    data: contentItems = [],
    error: contentItemError,
    isLoading: isLoadingContentItems,
    mutate: refreshContentItems,
  } = useSWR<ContentItemRow[]>(
    currentWorkspace ? [currentWorkspace.id, "content", filterValues] : null,
    () =>
      listContentItems(currentWorkspace.id, {
        schemaIds:
          filterValues.schemaId !== "all" ? [filterValues.schemaId] : undefined,
      }).then((res) => res.data ?? [])
  );

  const {
    data: contentSchemas = [],
    error: contentSchemasError,
    isLoading: isLoadingSchemas,
    mutate: refreshSchemas,
  } = useSWR<ContentSchemaRow[]>(
    currentWorkspace ? [currentWorkspace.id, "schemas"] : null,
    () => listSchemas(currentWorkspace.id).then((res) => res.data ?? [])
  );

  // Parse and apply filters from URL query parameters only on mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const initialFilters: FilterValues = {
      schemaId: queryParams.get("schema") || "all",
      search: queryParams.get("search") || "",
    };
    const page = Number(queryParams.get("page")) || 1;
    const perPage = Number(queryParams.get("perPage")) || 10;

    const sort = queryParams.get("sort") || "title";
    setSortField(sort);

    setFilterValues(initialFilters);
    setCurrentPage(page);
    setItemsPerPage(perPage);
  }, []);

  // Sync local state with query parameters when they change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("schema", filterValues.schemaId || "all");
    if (filterValues.search) params.set("search", filterValues.search);
    if (sortField && sortField !== "title") params.set("sort", sortField);
    params.set("page", currentPage.toString());
    params.set("perPage", itemsPerPage.toString());

    const newSearch = params.toString();

    // Only update search params if parameters have actually changed
    navigate({
      search: newSearch,
    });
  }, [filterValues, sortField, currentPage, itemsPerPage]);

  const onSubmitFilters = (values: FilterValues) => {
    setFilterValues(values);
  };

  const resetFilters = () => {
    setFilterValues({
      schemaId: "all",
      search: "",
    });
  };

  const handleRowClick = (item: ContentItemRow) => {
    navigate(`/manager/editor/${item.id}`);
  };

  const handleCreateNew = async (schemaId: string) => {
    if (!currentWorkspace) return;

    try {
      // Fetch schema to check type
      const schemaResponse = await getSchema(
        parseInt(schemaId),
        currentWorkspace.id
      );

      if (schemaResponse.error) {
        toast({
          title: "Error loading schema",
          description: "Could not load schema details. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const schema = schemaResponse.data;

      // If single-type schema, check for existing content
      if (schema && schema.type === "single") {
        const existingContentResponse = await listContentItemsBySchema(
          parseInt(schemaId),
          currentWorkspace.id
        );

        if (existingContentResponse.error) {
          toast({
            title: "Error checking content",
            description: "Could not check existing content. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (
          existingContentResponse.data &&
          existingContentResponse.data.length > 0
        ) {
          toast({
            title: "Cannot create new content",
            description:
              "This single-type schema already has content. Edit the existing item instead.",
            variant: "destructive",
          });
          return;
        }
      }

      // Proceed with navigation
      navigate(`/manager/editor/${schemaId}/new`);
    } catch (error) {
      console.error("Error in handleCreateNew:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
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
      search: params.toString(),
    });
  };

  const handleDelete = async () => {
    try {
      // Delete all items concurrently
      await Promise.all(
        selectedItems.map((contentItem) =>
          deleteContentItem(contentItem.id, currentWorkspace!.id)
        )
      );

      refreshContentItems();
      refreshSchemas();
      setSelectedItems([]);
      setShowDeleteDialog(false);

      toast({
        title: "Items deleted",
        description: `Successfully deleted ${selectedItems.length} item${
          selectedItems.length !== 1 ? "s" : ""
        }.`,
      });
    } catch (error) {
      notifyError(toast, error, {
        title: "Delete failed",
        fallback:
          "There was an error deleting the selected items. Please try again.",
        prefix: "Delete failed",
      });
    }
  };

  const sortOptions: SortOption[] = React.useMemo(
    () => [
      { value: "title", label: "Title (A-Z)" },
      { value: "updatedAt", label: "Last Updated" },
      { value: "createdAt", label: "Date Created" },
    ],
    []
  );

  const isLoading = isLoadingContentItems || isLoadingSchemas;

  return (
    <div className="space-y-6">
      <ContentListHeader
        handleCreateNew={handleCreateNew}
        schemas={contentSchemas}
      />

      {(contentItemError || contentSchemasError) && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-2">
            <Icons.AlertCircle size={16} className="text-destructive" />
            <p className="text-sm text-destructive">
              Warning: Some data could not be loaded. Please refresh the page or
              try again.
            </p>
          </div>
        </div>
      )}

      <div className={`rounded-md border bg-white`}>
        <div className={`px-3 py-3 bg-muted/20`}>
          <FilterForm
            onSubmitFilters={onSubmitFilters}
            resetFilters={resetFilters}
            schemas={contentSchemas}
            initialValues={filterValues}
          />
        </div>

        {selectedItems.length === 0 ? (
          <ResultsBar
            totalItems={contentItems.length}
            sortField={sortField}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
          />
        ) : (
          <SelectionActionsBar
            selectedCount={selectedItems.length}
            actions={[
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
            <Icons.Loader2
              className={`icon-lg animate-spin text-primary mr-2`}
            />
            <p className="text-lg">Loading content...</p>
          </div>
        ) : (
          <ContentTable
            items={contentItems}
            schemas={contentSchemas}
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
              This will permanently delete {selectedItems.length} selected{" "}
              {selectedItems.length === 1 ? "item" : "items"}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default ContentManagerPage;
