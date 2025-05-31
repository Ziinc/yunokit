import { ContentSchema, ContentField } from "../contentSchema";
import { contentSchemas as exampleSchemas } from "../mocks";
import { supabase } from "../supabase";
import type { Database } from "../supabase";
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;
type ContentSchemaRow = Database['public']['Tables']['content_schemas']['Row'];

// In-memory storage
let schemas: ContentSchema[] = [...exampleSchemas];

// Helper to convert Supabase schema to our ContentSchema type
const convertSupabaseSchema = (schema: ContentSchemaRow): ContentSchema => ({
  id: schema.id,
  name: schema.name,
  fields: schema.fields,
  type: schema.type as 'collection' | 'single'
});

/**
 * SchemaApi - Provides methods for managing content schemas
 */
export class SchemaApi {
  // Initialize storage with example schemas if empty
  static async initializeStorage(): Promise<void> {
    if (schemas.length === 0) {
      schemas = [...exampleSchemas];
    }
  }

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

    return schemas;
  }

  static async getSchemaById(id: string): Promise<ContentSchema | null> {
    const schemas = await this.getSchemas();
    return schemas.find(schema => schema.id === id) || null;
  }

  static async saveSchema(schema: ContentSchema): Promise<ContentSchema> {
    const existingIndex = schemas.findIndex(s => s.id === schema.id);
    
    if (existingIndex >= 0) {
      schemas[existingIndex] = schema;
    } else {
      schemas.push(schema);
    }
    
    return schema;
  }

  static async saveSchemas(newSchemas: ContentSchema[]): Promise<ContentSchema[]> {
    schemas = newSchemas;
    return schemas;
  }

  static async deleteSchema(id: string): Promise<void> {
    schemas = schemas.filter(schema => schema.id !== id);
  }

  static async renameField(schemaId: string, fieldId: string, newName: string): Promise<ContentSchema> {
    const schemaIndex = schemas.findIndex(s => s.id === schemaId);
    
    if (schemaIndex === -1) {
      throw new Error(`Schema with id ${schemaId} not found`);
    }

    const schema = schemas[schemaIndex];
    const fieldIndex = schema.fields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex === -1) {
      throw new Error(`Field with id ${fieldId} not found in schema ${schemaId}`);
    }

    // Create updated field and schema
    const updatedField = { ...schema.fields[fieldIndex], name: newName };
    const updatedFields = [...schema.fields];
    updatedFields[fieldIndex] = updatedField;
    const updatedSchema = { ...schema, fields: updatedFields };

    // Save the updated schema
    schemas[schemaIndex] = updatedSchema;
    return updatedSchema;
  }

  static async reorderFields(schemaId: string, fieldIds: string[]): Promise<ContentSchema> {
    const schemaIndex = schemas.findIndex(s => s.id === schemaId);
    
    if (schemaIndex === -1) {
      throw new Error(`Schema with id ${schemaId} not found`);
    }

    const schema = schemas[schemaIndex];
    
    // Create a map of fields by ID for quick lookup
    const fieldsMap = new Map(schema.fields.map(field => [field.id, field]));
    
    // Reorder fields based on the provided field IDs
    const reorderedFields = fieldIds.map(id => {
      const field = fieldsMap.get(id);
      if (!field) {
        throw new Error(`Field with id ${id} not found in schema ${schemaId}`);
      }
      return field;
    });

    // Update and save the schema
    const updatedSchema = { ...schema, fields: reorderedFields };
    schemas[schemaIndex] = updatedSchema;
    return updatedSchema;
  }

  static async updateField(schemaId: string, fieldId: string, updates: Partial<ContentField>): Promise<ContentSchema> {
    const schemaIndex = schemas.findIndex(s => s.id === schemaId);
    
    if (schemaIndex === -1) {
      throw new Error(`Schema with id ${schemaId} not found`);
    }

    const schema = schemas[schemaIndex];
    const fieldIndex = schema.fields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex === -1) {
      throw new Error(`Field with id ${fieldId} not found in schema ${schemaId}`);
    }

    // Create updated field and schema
    const updatedField = { ...schema.fields[fieldIndex], ...updates };
    const updatedFields = [...schema.fields];
    updatedFields[fieldIndex] = updatedField;
    const updatedSchema = { ...schema, fields: updatedFields };

    // Save the updated schema
    schemas[schemaIndex] = updatedSchema;
    return updatedSchema;
  }
} 