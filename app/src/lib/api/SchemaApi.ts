import { ContentSchema } from "../contentSchema";
import { contentSchemas as exampleSchemas } from "../mocks";

// Storage keys
const SCHEMA_STORAGE_KEY = 'supacontent-schemas';

// Helper to simulate network delay for a more realistic experience
const simulateNetworkDelay = async (minMs: number = 300, maxMs: number = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * SchemaApi - Provides methods for managing content schemas
 * Currently uses localStorage for persistence, but can be extended to use real APIs
 */
export class SchemaApi {
  // Initialize storage with example schemas if empty
  static async initializeStorage(): Promise<void> {
    const storedSchemas = localStorage.getItem(SCHEMA_STORAGE_KEY);
    if (!storedSchemas) {
      await this.saveSchemas(exampleSchemas);
      console.log("Initialized schema storage with example schemas");
    }
  }

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
  }
} 