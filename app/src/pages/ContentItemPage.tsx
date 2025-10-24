import React, { useCallback, useRef, useState } from "react";
import { ContentItemEditor } from "@/components/Content/ContentItemEditor";
import { useParams, useNavigate } from "react-router-dom";
import { ContentItem } from "@/lib/api/SchemaApi";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileX2, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { BackIconButton } from "@/components/ui/BackIconButton";
import { useToast } from "@/hooks/use-toast";
import { createErrorHandler, notifySuccess } from "@/lib/errors";
import { getSchema, ContentSchemaRow } from "@/lib/api/SchemaApi";
import {
  createContentItem,
  updateContentItem,
  getContentItemById,
} from "@/lib/api/ContentApi";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import useSWR from "swr";
import type { Json } from "../../database.types";
import { JSONContent } from "@tiptap/core";
// Remove css-constants over-abstraction; use Tailwind utilities directly

const ContentItemPage = () => {
  const { contentId, schemaId } = useParams<{ contentId?: string; schemaId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const errorHandler = createErrorHandler(toast);
  const [hasChanges, setHasChanges] = useState(false);
  const saveHandlerRef = useRef<() => void>(() => {});

  const registerSaveHandler = useCallback((handler: () => void) => {
    saveHandlerRef.current = handler;
  }, []);
  
  const contentIdNumber = contentId ? Number(contentId) : null;
  const schemaIdNumber = schemaId ? Number(schemaId) : null;
  
  // Load content item if editing existing
  const { 
    data: contentItemResponse, 
    error: contentItemError, 
    isLoading: isLoadingContentItem,
    mutate: mutateContentItem
  } = useSWR(
    currentWorkspace && contentIdNumber ? `content-item-${contentIdNumber}` : null,
    () => getContentItemById(contentIdNumber!, currentWorkspace!.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const contentItemData = contentItemResponse?.data;
  
  // Load schema from database
  const { 
    data: schemaResponse, 
    error: schemaError, 
    isLoading: isLoadingSchema 
  } = useSWR(
    currentWorkspace && (contentItemData?.schema_id || schemaIdNumber) ? 
      `schema-${contentItemData?.schema_id || schemaIdNumber}` : null,
    () => {
      const targetSchemaId = contentItemData?.schema_id || schemaIdNumber;
      if (targetSchemaId && currentWorkspace) {
        return getSchema(targetSchemaId, currentWorkspace.id);
      }
      return null;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const schema: ContentSchemaRow | undefined = schemaResponse?.data;
  

  // Convert database row to ContentItem format
  const contentItem: ContentItem | undefined = contentItemData ? {
    id: contentItemData.id.toString(),
    schemaId: contentItemData.schema_id?.toString() || '',
    title: contentItemData.title || 'Untitled',
    status: 'draft' as ContentItem['status'], // Map from database status if available
    createdAt: contentItemData.created_at,
    updatedAt: contentItemData.updated_at || contentItemData.created_at,
    publishedAt: contentItemData.published_at || undefined,
    data: (contentItemData.data as Record<string, unknown>) || {},
  } : undefined;
  
  // Helper function to get content data (handles both content and data fields)
  const getContentData = (item?: ContentItem) => {
    if (!item) return {};
    return item.data || {};
  };
  
  // Set up initial content
  const initialContent = getContentData(contentItem) || {};

  const handleSave = async (
    contentItem: {
      title: string
      data: JSONContent
    }
  ) => {
    if (!currentWorkspace || !schema) {
      errorHandler.handleError(new Error("Workspace or schema not found"), {
        title: "Error",
        fallback: "Workspace or schema not found"
      });
      return;
    }

    if (!contentIdNumber && schema?.archived_at) {
      errorHandler.handleError(new Error("Schema is archived"), {
        title: "Schema archived",
        fallback: "Cannot create content for an archived schema."
      });
      return;
    }

    await errorHandler.withErrorHandling(
      async () => {
        const title = contentItem.title || 'Untitled';

        if (contentIdNumber) {
          // Update existing content item
          const updateData = {
            title: title as string,
            data: contentItem.data as Json,
            updated_at: new Date().toISOString(),
          };

          await updateContentItem(contentIdNumber, updateData, currentWorkspace.id);

          notifySuccess(toast, {
            title: "Content updated",
            description: "The content has been updated successfully."
          });
        } else {
          // Create new content item
          const createData = {
            schema_id: schemaIdNumber,
            title: title as string,
            data: contentItem.data as Json,
          };

          const response = await createContentItem(createData, currentWorkspace.id);

          if (response.data) {
            // Navigate to the edit page for the newly created item
            navigate(`/manager/editor/${response.data.id}`);
          }

          notifySuccess(toast, {
            title: "Content created",
            description: "The content has been created successfully."
          });
        }

        // Refresh the content item data
        mutateContentItem();
      },
      {
        title: "Error",
        fallback: "Failed to save content. Please try again.",
        prefix: "Error saving content item"
      }
    );

    // No need to handle errors explicitly - the errorHandler does it for us
  };
  
  // Show loading state
  if (isLoadingSchema || (contentId && isLoadingContentItem)) {
    return (
      <div className="flex-center-justify h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (schemaError || contentItemError) {
    return (
      <div className="flex-center-justify h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading content</p>
          <BackIconButton label="Back to manager" onClick={() => navigate('/manager')} />
        </div>
      </div>
    );
  }

  // Show schema not found
  if (!schema) {
    return (
      <div className="flex-center-justify h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Schema not found</p>
          <BackIconButton label="Back to manager" onClick={() => navigate('/manager')} />
        </div>
      </div>
    );
  }

  // Show content item not found
  if (contentId && !contentItem) {
    return (
      <div className={`max-w-7xl mx-auto p-6 space-content-lg`}>
        <div className={`flex items-center justify-start gap-4`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/manager')}
                >
                  <ChevronLeft size={16} />
                  <span className="sr-only">Back</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent />
            </Tooltip>
          </TooltipProvider>
        </div>
            <div className="flex-center-justify h-[50vh]">
              <div className="text-center">
                <FileX2 className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="mt-4 text-muted-foreground">Content item not found</p>
              </div>
            </div>
      </div>
    );
  }

  // Use schema directly
  const contentSchema = schema;

  return (
    <>
      <div className={`max-w-7xl mx-auto p-6 space-content-lg`}>
        <div className={`flex items-center justify-start gap-4`}>
          <BackIconButton label="Back to manager" onClick={() => navigate('/manager')} />

          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {contentId ? 'Edit Content' : 'Create Content'} - {schema.name}
            </h1>
            <p className="text-muted-foreground">
              {contentId ? 'Update your content item' : 'Create a new content item'}
            </p>
          </div>
          <Button
            onClick={() => saveHandlerRef.current?.()}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>

        {contentSchema && (
          <div className="grid grid-cols-1 gap-6">
            <div className="col-span-1">
              <ContentItemEditor
                schema={contentSchema}
                initialData={initialContent}
                initialTitle={contentItem?.title || ""}
                onSave={handleSave}
                onChangesDetected={setHasChanges}
                registerSaveHandler={registerSaveHandler}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ContentItemPage;
