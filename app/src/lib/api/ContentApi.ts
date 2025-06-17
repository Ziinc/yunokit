import { ContentItem, ContentSchema } from "../contentSchema";
import { mockContentItems } from "../mocks";
import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;
export type ContentItemRow = Database['supacontent']['Tables']['contents']['Row'];

// In-memory storage
let contentItems: ContentItem[] = [...mockContentItems];
let schemas: ContentSchema[] = [];

// Helper to convert Supabase content to our ContentItem type
const convertSupabaseContent = (content: ContentItemRow): ContentItem => ({
  id: content.id,
  title: content.title,
  status: content.status,
  createdAt: content.created_at,
  updatedAt: content.updated_at,
  schemaId: content.schema_id || '',
  data: content.data as Record<string, any>
});


// Content Item Operations
export const listContentItems = async (workspaceId?: number) => {
    return await supabase.functions.invoke<ContentItemRow[]>(`proxy/contents?workspaceId=${workspaceId}`, {
    method: "GET",
  });

};

export const getContentItemById = async (id: string): Promise<ContentItem | null> => {
  const items = await listContentItems();
  return items.find(item => item.id === id) || null;
};

export const listContentItemsBySchema = async (schemaId: string): Promise<ContentItem[]> => {
  const items = await listContentItems();
  return items.filter(item => item.schemaId === schemaId);
};

export const saveContentItem = async (item: ContentItem): Promise<ContentItem> => {
  const existingIndex = contentItems.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    contentItems[existingIndex] = {
      ...item,
      updatedAt: new Date().toISOString()
    };
  } else {
    contentItems.push({
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return item;
};

export const saveContentItems = async (items: ContentItem[]): Promise<ContentItem[]> => {
  contentItems = items;
  return items;
};

export const deleteContentItem = async (id: string): Promise<void> => {
  contentItems = contentItems.filter(item => item.id !== id);
};

// Template Operations
export const resetStorage = async (): Promise<void> => {
  contentItems = [...mockContentItems];
  schemas = [];
}; 