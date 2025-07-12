import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Files,
  File,
  Layers,
  Loader2,
  Archive,
  Trash2,
  Calendar,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ContentSchemaEditor } from "@/components/Content/ContentSchemaEditor";
import {
  listSchemas,
  createSchema,
  updateSchema,
  deleteSchema,
  ContentSchemaRow,
} from "@/lib/api/SchemaApi";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationControls } from "@/components/Content/ContentList/PaginationControls";
import { DocsButton } from "@/components/ui/DocsButton";
import { SelectionActionsBar } from "@/components/ui/SelectionActionsBar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/utils/formatDate";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { isFeatureEnabled, FeatureFlags, type FeatureFlag } from "@/lib/featureFlags";
import useSWR from "swr";

// Schema Table Component
const SchemaTable: React.FC<{
  schemas: ContentSchemaRow[];
  onRowClick: (schema: ContentSchemaRow) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onSelectionChange?: (selectedSchemas: ContentSchemaRow[]) => void;
}> = ({
  schemas,
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  onSelectionChange,
}) => {
  const [selectedSchemas, setSelectedSchemas] = useState<number[]>([]);

  const handleSelectSchema = (e: React.MouseEvent, schemaId: number) => {
    e.stopPropagation();

    setSelectedSchemas((prev) => {
      const newSelection = prev.includes(schemaId)
        ? prev.filter((id) => id !== schemaId)
        : [...prev, schemaId];

      if (onSelectionChange) {
        const selectedItems = schemas.filter((schema) =>
          newSelection.includes(schema.id)
        );
        onSelectionChange(selectedItems);
      }

      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const newSelection = !isAllSelected
      ? schemas.map((schema) => schema.id)
      : [];
    setSelectedSchemas(newSelection);

    if (onSelectionChange) {
      const selectedItems = schemas.filter((schema) =>
        newSelection.includes(schema.id)
      );
      onSelectionChange(selectedItems);
    }
  };

  const isAllSelected =
    schemas.length > 0 && selectedSchemas.length === schemas.length;
  const isPartiallySelected =
    selectedSchemas.length > 0 && selectedSchemas.length < schemas.length;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={isAllSelected || isPartiallySelected}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary square-checkbox rounded-none"
              />
            </TableHead>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="w-[120px]">Fields</TableHead>
            <TableHead className="w-[200px]">Description</TableHead>
            <TableHead>
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                Last Updated
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schemas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No schemas found.
              </TableCell>
            </TableRow>
          ) : (
            schemas.map((schema) => (
              <TableRow
                key={schema.id}
                className="cursor-pointer hover:bg-muted"
                data-selected={selectedSchemas.includes(schema.id)}
                onClick={() => onRowClick(schema)}
              >
                <TableCell className="p-2">
                  <div
                    onClick={(e) => handleSelectSchema(e, schema.id)}
                    className="h-full flex items-center justify-center"
                  >
                    <Checkbox
                      checked={selectedSchemas.includes(schema.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {schema.type === "collection" ? (
                      <Files className="h-4 w-4" />
                    ) : (
                      <File className="h-4 w-4" />
                    )}
                    {schema.name}
                  </div>
                </TableCell>
                <TableCell>
                  {schema.type === "collection" ? "Collection" : "Single"}
                </TableCell>
                <TableCell>
                  {schema.fields?.length || 0} field
                  {(schema.fields?.length || 0) !== 1 ? "s" : ""}
                </TableCell>
                <TableCell className="text-muted-foreground truncate">
                  {schema.description || "No description"}
                </TableCell>
                <TableCell>{formatDate(schema.updated_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {schemas.length > 0 && (
        <div className="flex justify-between items-center p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, schemas.length)} of{" "}
            {schemas.length} schemas
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}
    </div>
  );
};


const ContentSchemaBuilderPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [schemaTypeFilter, setSchemaTypeFilter] = useState<
    "all" | "collection" | "single" | "archived"
  >("all");
  const [schemasPerPage, setSchemasPerPage] = useState(10);
  const [currentSchemasPage, setCurrentSchemasPage] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSchemas, setSelectedSchemas] = useState<ContentSchemaRow[]>(
    []
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const {
    data: schemasResponse,
    isLoading,
    mutate: mutateSchemas,
  } = useSWR(
    currentWorkspace ? `schemas-${currentWorkspace.id}` : null,
    () => listSchemas(currentWorkspace!.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const schemas = schemasResponse?.data || [];
  console.log("schemas", schemas);
  console.log("schemasResponse", schemasResponse);

  // Filter schemas based on type filter and search query
  const filteredSchemas = useMemo(() => {
    // First filter by type and archived status
    const filtered = schemas.filter((schema) => {
      if (
        !isFeatureEnabled(FeatureFlags.SCHEMA_ARCHIVING as FeatureFlag) &&
        schema.archived_at
      )
        return false;
      if (schemaTypeFilter === "archived")
        return (
          isFeatureEnabled(FeatureFlags.SCHEMA_ARCHIVING as FeatureFlag) &&
          schema.archived_at
        );
      if (schemaTypeFilter === "collection")
        return schema.type === "collection" && !schema.archived_at;
      if (schemaTypeFilter === "single")
        return schema.type === "single" && !schema.archived_at;
      return (
        !schema.archived_at ||
        (isFeatureEnabled(FeatureFlags.SCHEMA_ARCHIVING as FeatureFlag) &&
          schema.archived_at)
      ); // "all" shows everything except archived unless feature enabled
    });

    // Then apply search filter
    if (!searchQuery.trim()) return filtered;

    const searchLower = searchQuery.toLowerCase();
    return filtered.filter(
      (schema) =>
        schema.name?.toLowerCase().includes(searchLower) ||
        (schema.description &&
          schema.description.toLowerCase().includes(searchLower))
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

  const handleCreateSchema = async (schema: Partial<ContentSchemaRow>) => {
    try {
      const response = await createSchema(schema, currentWorkspace!.id);

      if (response.error) {
        console.error("Error creating schema:", response.error);
        toast({
          title: "Error creating schema",
          description: "There was a problem creating the schema.",
          variant: "destructive",
        });
        return;
      }

      mutateSchemas((prev) => {
        if (!prev) return { data: [response.data], error: null };
        return { ...prev, data: [...prev.data, response.data] };
      });

      setIsCreating(false);
      toast({
        title: "Schema created",
        description: `${schema.name} schema has been created successfully. Click on it to add fields and make it useful!`,
      });

      // Navigate to edit the newly created schema
      navigate(`/builder/schemas/${response.data.id}`);
    } catch (error) {
      console.error("Error creating schema:", error);
      toast({
        title: "Error creating schema",
        description: "Unexpected error occurred while creating the schema.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveSchemas = async () => {
    try {
      const updatedSchemas = await Promise.all(
        selectedSchemas.map(async (schema) => {
          const updated = { ...schema, archived_at: new Date().toISOString() };
          const response = await updateSchema(schema.id, updated, currentWorkspace!.id);

          if (response.error) {
            console.error("Error archiving schema:", response.error);
            throw new Error(response.error.message);
          }

          return response.data;
        })
      );

      mutateSchemas((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((schema) =>
            selectedSchemas.find((s) => s.id === schema.id)
              ? updatedSchemas.find((u) => u.id === schema.id)!
              : schema
          ),
        };
      });

      setSelectedSchemas([]);

      toast({
        title: "Schemas archived",
        description: `Successfully archived ${selectedSchemas.length} schema${
          selectedSchemas.length !== 1 ? "s" : ""
        }.`,
      });
    } catch (error) {
      console.error("Error archiving schemas:", error);
      toast({
        title: "Error archiving schemas",
        description: "There was a problem archiving the selected schemas.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchemas = async () => {
    try {
      await Promise.all(
        selectedSchemas.map((schema) =>
          deleteSchema(schema.id, currentWorkspace!.id)
        )
      );

      mutateSchemas((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.filter(
            (schema) => !selectedSchemas.find((s) => s.id === schema.id)
          ),
        };
      });

      setSelectedSchemas([]);
      setShowDeleteDialog(false);

      toast({
        title: "Schemas deleted",
        description: `Successfully deleted ${selectedSchemas.length} schema${
          selectedSchemas.length !== 1 ? "s" : ""
        }.`,
      });
    } catch (error) {
      console.error("Error deleting schemas:", error);
      toast({
        title: "Error deleting schemas",
        description: "Unexpected error occurred while deleting the schemas.",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (schema: ContentSchemaRow) => {
    navigate(`/builder/schemas/${schema.id}`);
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Content Schema Builder
            </h1>
            <DocsButton href="https://yunokit.com/docs/schema-builder" />
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your content schemas for your content items
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

      {/* Search, filters and schema list with white background */}
      <div className="bg-white border rounded-lg">
        {/* Search and filter in the same row */}
        <div className="p-6 pb-0 space-y-6">
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
              onValueChange={(v) =>
                setSchemaTypeFilter(
                  v as "all" | "collection" | "single" | "archived"
                )
              }
            >
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Layers size={16} />
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="collection"
                  className="flex items-center gap-2"
                >
                  <Files size={16} />
                  Collections
                </TabsTrigger>
                <TabsTrigger value="single" className="flex items-center gap-2">
                  <File size={16} />
                  Singles
                </TabsTrigger>
                {isFeatureEnabled(FeatureFlags.SCHEMA_ARCHIVING as FeatureFlag) && (
                  <TabsTrigger
                    value="archived"
                    className="flex items-center gap-2"
                  >
                    <Archive size={16} />
                    Archived
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Schema list */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p className="text-lg">Loading schemas...</p>
            </div>
          ) : paginatedSchemas.length === 0 ? (
            <div className="py-16 text-center">
              {searchQuery ? (
                <div className="text-muted-foreground">
                  No schemas match your search criteria
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-muted-foreground">
                    No schemas found. Create your first schema to get started.
                  </div>
                  <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus size={16} />
                    Create Schema
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {selectedSchemas.length > 0 && (
                <SelectionActionsBar
                  selectedCount={selectedSchemas.length}
                  actions={[
                    ...(isFeatureEnabled(FeatureFlags.SCHEMA_ARCHIVING as FeatureFlag)
                      ? [
                          {
                            label: "Archive",
                            icon: <Archive size={16} />,
                            onClick: handleArchiveSchemas,
                          },
                        ]
                      : []),
                    {
                      label: "Delete",
                      icon: <Trash2 size={16} />,
                      onClick: () => setShowDeleteDialog(true),
                      variant: "destructive",
                    },
                  ]}
                />
              )}
              <SchemaTable
                schemas={paginatedSchemas}
                onRowClick={handleRowClick}
                currentPage={currentSchemasPage}
                totalPages={totalSchemaPages}
                onPageChange={setCurrentSchemasPage}
                itemsPerPage={schemasPerPage}
                onItemsPerPageChange={setSchemasPerPage}
                onSelectionChange={setSelectedSchemas}
              />
            </>
          )}
        </div>
      </div>

      {/* Add delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedSchemas.length} selected{" "}
              {selectedSchemas.length === 1 ? "schema" : "schemas"}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchemas}
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

export default ContentSchemaBuilderPage;
