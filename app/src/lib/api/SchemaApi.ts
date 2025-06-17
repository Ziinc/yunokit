import { ContentSchema, ContentField } from "../contentSchema";
import { contentSchemas as exampleSchemas } from "../mocks";
import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type DbClient = SupabaseClient<Database>;
export type ContentSchemaRow = Database["supacontent"]["Tables"]["schemas"]["Row"];

export const listSchemas = async (
  workspaceId: number
): Promise<ContentSchema[]> => {
  const name = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });
  const { data, error } = await (supabase as DbClient).functions.invoke(
    `proxy/schemas?${name.toString()}`,
    {
      method: "GET",
    }
  );
  if (error) throw error;
  return data;
};

export const getSchemaById = async (
  id: string
): Promise<ContentSchema | null> => {
  const schemas = await listSchemas();
  return schemas.find((schema) => schema.id === id) || null;
};

export const saveSchema = async (
  schema: ContentSchema
): Promise<ContentSchema> => {
  const existingIndex = schemas.findIndex((s) => s.id === schema.id);

  if (existingIndex >= 0) {
    schemas[existingIndex] = schema;
  } else {
    schemas.push(schema);
  }

  return schema;
};

export const saveSchemas = async (
  newSchemas: ContentSchema[]
): Promise<ContentSchema[]> => {
  schemas = newSchemas;
  return schemas;
};

export const deleteSchema = async (id: string): Promise<void> => {
  schemas = schemas.filter((schema) => schema.id !== id);
};

export const renameField = async (
  schemaId: string,
  fieldId: string,
  newName: string
): Promise<ContentSchema> => {
  const schemaIndex = schemas.findIndex((s) => s.id === schemaId);

  if (schemaIndex === -1) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const schema = schemas[schemaIndex];
  const fieldIndex = schema.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    throw new Error(`Field with id ${fieldId} not found in schema ${schemaId}`);
  }

  const updatedField = { ...schema.fields[fieldIndex], name: newName };
  const updatedFields = [...schema.fields];
  updatedFields[fieldIndex] = updatedField;
  const updatedSchema = { ...schema, fields: updatedFields };

  schemas[schemaIndex] = updatedSchema;
  return updatedSchema;
};

export const reorderFields = async (
  schemaId: string,
  fieldIds: string[]
): Promise<ContentSchema> => {
  const schemaIndex = schemas.findIndex((s) => s.id === schemaId);

  if (schemaIndex === -1) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const schema = schemas[schemaIndex];
  const fieldsMap = new Map(schema.fields.map((field) => [field.id, field]));

  const reorderedFields = fieldIds.map((id) => {
    const field = fieldsMap.get(id);
    if (!field) {
      throw new Error(`Field with id ${id} not found in schema ${schemaId}`);
    }
    return field;
  });

  const updatedSchema = { ...schema, fields: reorderedFields };
  schemas[schemaIndex] = updatedSchema;
  return updatedSchema;
};

export const updateField = async (
  schemaId: string,
  fieldId: string,
  updates: Partial<ContentField>
): Promise<ContentSchema> => {
  const schemaIndex = schemas.findIndex((s) => s.id === schemaId);

  if (schemaIndex === -1) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const schema = schemas[schemaIndex];
  const fieldIndex = schema.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    throw new Error(`Field with id ${fieldId} not found in schema ${schemaId}`);
  }

  const updatedField = { ...schema.fields[fieldIndex], ...updates };
  const updatedFields = [...schema.fields];
  updatedFields[fieldIndex] = updatedField;
  const updatedSchema = { ...schema, fields: updatedFields };

  schemas[schemaIndex] = updatedSchema;
  return updatedSchema;
};
