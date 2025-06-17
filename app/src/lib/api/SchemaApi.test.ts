import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ContentSchema } from '../contentSchema';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();


describe('SchemaApi', () => {
  // Test schema
  const testSchema: ContentSchema = {
    id: 'test-schema-id',
    name: 'Test Schema',
    description: 'A test schema for unit tests',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'markdown',
        required: true,
        description: 'Title of the content',
      },
      {
        id: 'body',
        name: 'Body',
        type: 'markdown',
        required: true,
        description: 'Main content body',
      },
    ],
    isCollection: true,
    schemaType: 'collection',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeStorage', () => {
    it('should initialize storage with default schemas if empty', async () => {
      await SchemaApi.initializeStorage();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not initialize storage if already populated', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testSchema]));
      await SchemaApi.initializeStorage();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getSchemas', () => {
    it('should return empty array if no schemas exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(null);
      const result = await SchemaApi.getSchemas();
      expect(result).toEqual([]);
    });

    it('should return schemas from storage', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testSchema]));
      const result = await SchemaApi.getSchemas();
      expect(result).toEqual([testSchema]);
    });
  });

  describe('getSchemaById', () => {
    it('should return null if schema does not exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testSchema]));
      const result = await SchemaApi.getSchemaById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return schema by id', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testSchema]));
      const result = await SchemaApi.getSchemaById('test-schema-id');
      expect(result).toEqual(testSchema);
    });
  });

  describe('saveSchema', () => {
    it('should add a new schema', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([]));
      const newSchema = { ...testSchema, id: undefined as any };
      
      await SchemaApi.saveSchema(newSchema);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedSchemas = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedSchemas.length).toBe(1);
      expect(savedSchemas[0].id).toBe('test-uuid');
    });

    it('should update an existing schema', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testSchema]));
      const updatedSchema = { 
        ...testSchema, 
        name: 'Updated Schema Name',
        description: 'Updated schema description',
      };
      
      await SchemaApi.saveSchema(updatedSchema);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedSchemas = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedSchemas.length).toBe(1);
      expect(savedSchemas[0].name).toBe('Updated Schema Name');
      expect(savedSchemas[0].description).toBe('Updated schema description');
    });
  });

  describe('deleteSchema', () => {
    it('should delete a schema', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testSchema]));
      
      await SchemaApi.deleteSchema('test-schema-id');
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedSchemas = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedSchemas.length).toBe(0);
    });

    it('should not change storage if schema does not exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testSchema]));
      
      await SchemaApi.deleteSchema('non-existent-id');
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedSchemas = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedSchemas.length).toBe(1);
    });
  });
}); 