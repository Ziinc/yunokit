import { ContentItem, ContentSchema } from "../contentSchema";
import { mockContentItems } from "../mocks";
import { supabase } from "../supabase";
import type { Database } from "../supabase";
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;
type ContentSchemaRow = Database['public']['Tables']['content_schemas']['Row'];
type ContentItemRow = Database['public']['Tables']['content_items']['Row'];

// Storage keys
const CONTENT_STORAGE_KEY = 'supacontent-content';
const SCHEMA_STORAGE_KEY = 'supacontent-schemas';

// Helper to convert Supabase content to our ContentItem type
const convertSupabaseContent = (content: ContentItemRow): ContentItem => ({
  id: content.id,
  title: content.title,
  status: content.status,
  createdAt: content.created_at,
  updatedAt: content.updated_at,
  createdBy: content.created_by,
  updatedBy: content.updated_by,
  schemaId: content.schema_id,
  workspaceId: content.workspace_id,
  data: content.data
});

// Helper to convert Supabase schema to our ContentSchema type
const convertSupabaseSchema = (schema: ContentSchemaRow): ContentSchema => ({
  id: schema.id,
  name: schema.name,
  description: schema.description,
  fields: schema.fields,
  isCollection: schema.is_collection,
  isArchived: schema.is_archived,
  createdAt: schema.created_at,
  updatedAt: schema.updated_at,
  workspaceId: schema.workspace_id
});

/**
 * ContentApi - Provides methods for managing content schemas and items
 * Currently uses localStorage for persistence, but can be extended to use real APIs
 */
export class ContentApi {
  // Initialize storage with example content items if empty
  static async initializeStorage(): Promise<void> {
    const storedItems = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!storedItems) {
      console.log("No stored content items found, initializing with mock data");
      console.log("Mock content items:", mockContentItems);
      await this.saveContentItems(mockContentItems);
      console.log("Initialized content storage with mock content items");
      
      // Verify the data was actually stored
      const verifyItems = localStorage.getItem(CONTENT_STORAGE_KEY);
      console.log("Verification - stored content items:", verifyItems ? JSON.parse(verifyItems).length : 'none');
    } else {
      console.log("Content items already exist in storage");
    }
  }

  // Schema Operations
  static async getSchemas(workspaceId?: string): Promise<ContentSchema[]> {
    if (supabase.auth) {
      let query = (supabase as DbClient)
        .from('content_schemas')
        .select<'*', ContentSchemaRow>('*');
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(convertSupabaseSchema);
    }

    const storedSchemas = localStorage.getItem(SCHEMA_STORAGE_KEY);
    if (!storedSchemas) return [];
    return JSON.parse(storedSchemas);
  }

  static async getSchemaById(id: string): Promise<ContentSchema | null> {
    const schemas = await this.getSchemas();
    return schemas.find(schema => schema.id === id) || null;
  }

  static async saveSchema(schema: ContentSchema): Promise<ContentSchema> {
    const schemas = await this.getSchemas();
    const existingIndex = schemas.findIndex(s => s.id === schema.id);
    
    if (existingIndex >= 0) {
      schemas[existingIndex] = schema;
    } else {
      schemas.push(schema);
    }
    
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schemas));
    return schema;
  }

  static async saveSchemas(schemas: ContentSchema[]): Promise<ContentSchema[]> {
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schemas));
    return schemas;
  }

  static async deleteSchema(id: string): Promise<void> {
    const schemas = await this.getSchemas();
    const filteredSchemas = schemas.filter(schema => schema.id !== id);
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(filteredSchemas));
    
    // Also delete any content items tied to this schema
    const contentItems = await this.getContentItems();
    const filteredItems = contentItems.filter(item => item.schemaId !== id);
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(filteredItems));
  }

  // Content Item Operations
  static async getContentItems(workspaceId?: string): Promise<ContentItem[]> {
    if (supabase.auth) {
      let query = (supabase as DbClient)
        .from('content_items')
        .select<'*', ContentItemRow>('*');
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(convertSupabaseContent);
    }

    const storedItems = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!storedItems) return mockContentItems;
    return JSON.parse(storedItems);
  }

  static async getContentItemById(id: string): Promise<ContentItem | null> {
    const items = await this.getContentItems();
    return items.find(item => item.id === id) || null;
  }

  static async getContentItemsBySchema(schemaId: string): Promise<ContentItem[]> {
    const items = await this.getContentItems();
    return items.filter(item => item.schemaId === schemaId);
  }

  static async saveContentItem(item: ContentItem): Promise<ContentItem> {
    const items = await this.getContentItems();
    const existingIndex = items.findIndex(i => i.id === item.id);
    
    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...item,
        updatedAt: new Date().toISOString()
      };
    } else {
      items.push({
        ...item,
        id: item.id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(items));
    return item;
  }

  static async saveContentItems(items: ContentItem[]): Promise<ContentItem[]> {
    console.log("Saving content items to storage:", items.length);
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(items));
    return items;
  }

  static async deleteContentItem(id: string): Promise<void> {
    const items = await this.getContentItems();
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(filteredItems));
  }

  // Template Operations
  static async resetStorage(): Promise<void> {
    localStorage.removeItem(SCHEMA_STORAGE_KEY);
    localStorage.removeItem(CONTENT_STORAGE_KEY);
  }
} 