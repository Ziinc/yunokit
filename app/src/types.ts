export interface Content {
  id: number;
  content_type_id: number;
  data: {
    [name: string]: any;
  };
  inserted_at: string;
  updated_at: string;
}
export interface ContentType {
  id: number;
  project_id: number;
  name: string;
  type: "single" | "collection";
  fields: ContentTypeField[];
  inserted_at: string;
}

export type ContentTypeParams = Omit<
  ContentType,
  "id" | "project_id" | "inserted_at"
>;

export interface ContentTypeField {
  name: string;
  type: "short-text" | "long-text" | "rich-text" | "boolean";
}

export interface Project {
  id: number;
  name: string;
  user_id: string;
  api_url: string;
  service_role_key: string;
}
