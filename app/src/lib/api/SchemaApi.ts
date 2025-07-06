import { ContentSchema, ContentField } from "../contentSchema";
import { supabase } from "../supabase";
import type { Database } from "../../../database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type DbClient = SupabaseClient<Database>;
export type ContentSchemaRow =
  Database["yunocontent"]["Tables"]["schemas"]["Row"];

// Helper function to transform database row to ContentSchema
const transformDbRowToSchema = (row: ContentSchemaRow): ContentSchema => {
  const fields = row.fields as any;
  return {
    id: row.id,
    name: fields?.name || 'Untitled Schema',
    description: fields?.description,
    fields: fields?.fields || [],
    isCollection: fields?.isCollection || false,
    schemaType: fields?.schemaType || 'collection',
    type: fields?.type || 'collection',
  };
};

// Helper function to transform ContentSchema to database format
const transformSchemaToDbFormat = (schema: ContentSchema) => {
  return {
    id: schema.id,
    type: schema.type || 'collection',
    fields: {
      name: schema.name,
      description: schema.description,
      fields: schema.fields,
      isCollection: schema.isCollection,
      schemaType: schema.schemaType,
      type: schema.type,
    },
  };
};

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

export const getSchemaById = async (
  id: string | number,
  workspaceId: number
)=> {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });
  
  return await supabase.functions.invoke<ContentSchemaRow[]>(
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
    `proxy/schemas?${qp.toString()}`,
    {
      method: "PUT",
      body: schema, 
    }
  );
};

export const saveSchema = async (
  schema: ContentSchema,
  workspaceId: number
): Promise<ContentSchema> => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
  });
  
  const dbFormat = transformSchemaToDbFormat(schema);
  
  if (schema.id) {
    // Update existing schema
    const { data } = await supabase.functions.invoke<ContentSchemaRow>(
      `proxy/schemas/${schema.id}?${qp.toString()}`,
      {
        method: "PUT",
        body: dbFormat,
      }
    );
    return transformDbRowToSchema(data!);
  } else {
    // Create new schema
    const { data } = await supabase.functions.invoke<ContentSchemaRow>(
      `proxy/schemas?${qp.toString()}`,
      {
        method: "POST",
        body: dbFormat,
      }
    );
    return transformDbRowToSchema(data!);
  }
};

export const saveSchemas = async (
  newSchemas: ContentSchema[],
  workspaceId: number
): Promise<ContentSchema[]> => {
  // Save each schema individually
  const savedSchemas = await Promise.all(
    newSchemas.map(schema => saveSchema(schema, workspaceId))
  );
  return savedSchemas;
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
  const schema = await getSchemaById(schemaId, workspaceId);
  
  if (!schema) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const fieldIndex = schema.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    throw new Error(`Field with id ${fieldId} not found in schema ${schemaId}`);
  }

  const updatedField = { ...schema.fields[fieldIndex], name: newName };
  const updatedFields = [...schema.fields];
  updatedFields[fieldIndex] = updatedField;
  const updatedSchema = { ...schema, fields: updatedFields };

  return await saveSchema(updatedSchema, workspaceId);
};

export const reorderFields = async (
  schemaId: string,
  fieldIds: string[],
  workspaceId: number
): Promise<ContentSchema> => {
  const schema = await getSchemaById(schemaId, workspaceId);

  if (!schema) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const fieldsMap = new Map(schema.fields.map((field) => [field.id, field]));

  const reorderedFields = fieldIds.map((id) => {
    const field = fieldsMap.get(id);
    if (!field) {
      throw new Error(`Field with id ${id} not found in schema ${schemaId}`);
    }
    return field;
  });

  const updatedSchema = { ...schema, fields: reorderedFields };
  return await saveSchema(updatedSchema, workspaceId);
};

export const updateField = async (
  schemaId: string,
  fieldId: string,
  updates: Partial<ContentField>,
  workspaceId: number
): Promise<ContentSchema> => {
  const schema = await getSchemaById(schemaId, workspaceId);

  if (!schema) {
    throw new Error(`Schema with id ${schemaId} not found`);
  }

  const fieldIndex = schema.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    throw new Error(`Field with id ${fieldId} not found in schema ${schemaId}`);
  }

  const updatedField = { ...schema.fields[fieldIndex], ...updates };
  const updatedFields = [...schema.fields];
  updatedFields[fieldIndex] = updatedField;
  const updatedSchema = { ...schema, fields: updatedFields };

  return await saveSchema(updatedSchema, workspaceId);
};
