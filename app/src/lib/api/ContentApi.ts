import { ContentItem, ContentSchema } from "../contentSchema";
import { mockContentItems } from "../mocks";
import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;
type ContentSchemaRow = Database['supacontent']['Tables']['schemas']['Row'];
type ContentItemRow = Database['supacontent']['Tables']['contents']['Row'];

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

// Helper to convert Supabase schema to our ContentSchema type
const convertSupabaseSchema = (schema: ContentSchemaRow): ContentSchema => ({
  id: schema.id,
  name: schema.name,
  fields: schema.fields as any[],
  type: schema.type
});

// Initialize storage with example content items if empty
export const initializeStorage = async (): Promise<void> => {
  if (contentItems.length === 0) {
    contentItems = [...mockContentItems];
    console.log("Initialized content storage with mock content items");
  }
};

// Schema Operations
export const getSchemas = async (workspaceId?: string): Promise<ContentSchema[]> => {
  if (supabase.auth) {
    let query = (supabase as DbClient)
      .from('supacontent.schemas')
      .select<'*', ContentSchemaRow>('*');
    
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(convertSupabaseSchema);
  }

  return schemas;
};

export const getSchemaById = async (id: string): Promise<ContentSchema | null> => {
  const schemas = await getSchemas();
  return schemas.find(schema => schema.id === id) || null;
};

export const saveSchema = async (schema: ContentSchema): Promise<ContentSchema> => {
  const existingIndex = schemas.findIndex(s => s.id === schema.id);
  
  if (existingIndex >= 0) {
    schemas[existingIndex] = schema;
  } else {
    schemas.push(schema);
  }
  
  return schema;
};

export const saveSchemas = async (newSchemas: ContentSchema[]): Promise<ContentSchema[]> => {
  schemas = newSchemas;
  return schemas;
};

export const deleteSchema = async (id: string): Promise<void> => {
  schemas = schemas.filter(schema => schema.id !== id);
  contentItems = contentItems.filter(item => item.schemaId !== id);
};

// Content Item Operations
export const getContentItems = async (workspaceId?: string): Promise<ContentItem[]> => {
  if (supabase.auth) {
    let query = (supabase as DbClient)
      .from('supacontent.contents')
      .select<'*', ContentItemRow>('*');
    
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(convertSupabaseContent);
  }

  return contentItems;
};

export const getContentItemById = async (id: string): Promise<ContentItem | null> => {
  const items = await getContentItems();
  return items.find(item => item.id === id) || null;
};

export const getContentItemsBySchema = async (schemaId: string): Promise<ContentItem[]> => {
  const items = await getContentItems();
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