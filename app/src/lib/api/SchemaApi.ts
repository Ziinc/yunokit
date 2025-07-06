import { ContentSchema, ContentField } from "../contentSchema";
import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type SchemaRow = Database["yunocontent"]["Tables"]["schemas"]["Row"]
export interface ContentSchemaRow extends  Omit<SchemaRow, "fields"> {
  fields: SchemaField[] | []
}

export enum SchemaFieldType{
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  BOOLEAN = "boolean",
  ENUM = "enum",
  RELATION = "relation",
  IMAGE = "image",
  MARKDOWN = "markdown",
  JSON = "json",
} 
export interface SchemaField { 
  id: string
  label: string
  description: string | null
  type: SchemaFieldType
  required: boolean
  default_value: string | boolean | number | null | Record<string, string>
  options: string[]
  relation_schema_id: string | null
} 

export const listSchemas = async (workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });
  
  return await supabase.functions.invoke<ContentSchemaRow[]>(
    `proxy/schemas?${qp.toString()}`,
    {
      method: "GET",
    }
  );
  
};

export const getSchema = async (
  id: string | number,
  workspaceId: number
)=> {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });
  
  return await supabase.functions.invoke<ContentSchemaRow>(
    `proxy/schemas/${id}?${qp.toString()}`,
    {
      method: "GET",
    }
  );
};

export const createSchema = async (
  schema: Partial<ContentSchemaRow>,
  workspaceId: number
)  => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentSchemaRow>(
    `proxy/schemas?${qp.toString()}`,
    {
      method: "POST",
      body: schema, 
    }
  );
};


export const updateSchema = async (
  schema: Partial<ContentSchemaRow>,
  workspaceId: number
)  => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });

  return await supabase.functions.invoke<ContentSchemaRow>(
    `proxy/schemas/${schema.id}?${qp.toString()}`,
    {
      method: "PUT",
      body: schema, 
    }
  );
};

export const deleteSchema = async (id: string, workspaceId: number): Promise<void> => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });
  
  await supabase.functions.invoke(
    `proxy/schemas/${id}?${qp.toString()}`,
    {
      method: "DELETE",
    }
  );
};

export const renameField = async (
  schemaId: string,
  fieldId: string,
  newName: string,
  workspaceId: number
): Promise<ContentSchema> => {
  const { data: schemaData } = await getSchemaById(schemaId, workspaceId);
  
  if (!schemaData || !schemaData.length) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const schema = schemaData[0];
  const fieldIndex = schema.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    throw new Error(`Field with id ${fieldId} not found in schema ${schemaId}`);
  }

  const updatedField = { ...schema.fields[fieldIndex], name: newName };
  const updatedFields = [...schema.fields];
  updatedFields[fieldIndex] = updatedField;
  const updatedSchema = { ...schema, fields: updatedFields };

  const { data } = await updateSchema(updatedSchema, workspaceId);
  return data!;
};

export const reorderFields = async (
  schemaId: string,
  fieldIds: string[],
  workspaceId: number
): Promise<ContentSchema> => {
  const { data: schemaData } = await getSchemaById(schemaId, workspaceId);

  if (!schemaData || !schemaData.length) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const schema = schemaData[0];
  const fieldsMap = new Map(schema.fields.map((field) => [field.id, field]));

  const reorderedFields = fieldIds.map((id) => {
    const field = fieldsMap.get(id);
    if (!field) {
      throw new Error(`Field with id ${id} not found in schema ${schemaId}`);
    }
    return field;
  });

  const updatedSchema = { ...schema, fields: reorderedFields };
  const { data } = await updateSchema(updatedSchema, workspaceId);
  return data!;
};

export const updateField = async (
  schemaId: string,
  fieldId: string,
  updates: Partial<ContentField>,
  workspaceId: number
): Promise<ContentSchema> => {
  const { data: schemaData } = await getSchemaById(schemaId, workspaceId);

  if (!schemaData || !schemaData.length) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const schema = schemaData[0];
  const fieldIndex = schema.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    throw new Error(`Field with id ${fieldId} not found in schema ${schemaId}`);
  }

  const updatedField = { ...schema.fields[fieldIndex], ...updates };
  const updatedFields = [...schema.fields];
  updatedFields[fieldIndex] = updatedField;
  const updatedSchema = { ...schema, fields: updatedFields };

  const { data } = await updateSchema(updatedSchema, workspaceId);
  return data!;
};
