import { ContentItem, ContentSchema } from "../contentSchema";
import { mockContentItems } from "../mocks";

// Storage keys
const SCHEMA_STORAGE_KEY = 'supacontent-schemas';
const CONTENT_STORAGE_KEY = 'supacontent-content-items';

// Helper to simulate network delay for a more realistic experience
const simulateNetworkDelay = async (minMs: number = 300, maxMs: number = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

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
  static async getSchemas(): Promise<ContentSchema[]> {
    await simulateNetworkDelay(200, 600);
    const storedSchemas = localStorage.getItem(SCHEMA_STORAGE_KEY);
    if (!storedSchemas) return [];
    return JSON.parse(storedSchemas);
  }

  static async getSchemaById(id: string): Promise<ContentSchema | null> {
    const schemas = await this.getSchemas();
    return schemas.find(schema => schema.id === id) || null;
  }

  static async saveSchema(schema: ContentSchema): Promise<ContentSchema> {
    await simulateNetworkDelay();
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
    await simulateNetworkDelay();
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schemas));
    return schemas;
  }

  static async deleteSchema(id: string): Promise<void> {
    await simulateNetworkDelay();
    const schemas = await this.getSchemas();
    const filteredSchemas = schemas.filter(schema => schema.id !== id);
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(filteredSchemas));
    
    // Also delete any content items tied to this schema
    const contentItems = await this.getContentItems();
    const filteredItems = contentItems.filter(item => item.schemaId !== id);
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(filteredItems));
  }

  // Content Item Operations
  static async getContentItems(): Promise<ContentItem[]> {
    await simulateNetworkDelay(200, 600);
    const storedItems = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!storedItems) return [];
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
    await simulateNetworkDelay();
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
    await simulateNetworkDelay();
    console.log("Saving content items to storage:", items.length);
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(items));
    return items;
  }

  static async deleteContentItem(id: string): Promise<void> {
    await simulateNetworkDelay();
    const items = await this.getContentItems();
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(filteredItems));
  }

  // Template Operations
  static async resetStorage(): Promise<void> {
    await simulateNetworkDelay(500, 1000);
    localStorage.removeItem(SCHEMA_STORAGE_KEY);
    localStorage.removeItem(CONTENT_STORAGE_KEY);
  }
} 