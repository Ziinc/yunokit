import { ContentItem, ContentSchema } from "../contentSchema";
import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;
export type ContentItemRow = Database['yunocontent']['Tables']['content_items']['Row'];

// Content Item Operations
export const listContentItems = async (workspaceId?: number) => {
  return  await supabase.functions.invoke<ContentItemRow[]>(`proxy/contents?workspaceId=${workspaceId}`, {
    method: "GET",
  });
};

export const getContentItemById = async (id: string): Promise<ContentItem | null> => {
  return  await supabase.functions.invoke<ContentItemRow>(`proxy/contents/${id}`, {
    method: "GET",
  });
};

export const listContentItemsBySchema = async (schemaId: string): Promise<ContentItem[]> => {
  const items = await listContentItems();
  return items.filter(item => item.schemaId === schemaId);
};

export const saveContentItem = async (item: ContentItem): Promise<ContentItem> => {
  try {
    // TODO: Implement actual save to database via API
    // For now, just return the item as-is
    console.log('Saving item:', item);
    return {
      ...item,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error saving content item:', error);
    throw error;
  }
};

export const saveContentItems = async (items: ContentItem[]): Promise<ContentItem[]> => {
  try {
    // TODO: Implement batch save to database via API
    console.log('Saving items:', items);
    return items;
  } catch (error) {
    console.error('Error saving content items:', error);
    throw error;
  }
};

export const deleteContentItem = async (id: string): Promise<void> => {
  try {
    // TODO: Implement actual delete from database via API
    console.log('Deleting item:', id);
  } catch (error) {
    console.error('Error deleting content item:', error);
    throw error;
  }
};

// Template Operations
export const resetStorage = async (): Promise<void> => {
  // TODO: Implement if needed for real database operations
  console.log('Reset storage called');
}; 