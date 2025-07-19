import { createProxyApp } from "./app.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  createContentItem,
  deleteContentItem,
  getContentItem,
  listContentItems,
} from "./content_items.ts";
import {
  createContentItemVersion,
  deleteContentItemVersion,
  getContentItemVersion,
  getContentItemVersionHistory,
  listContentItemVersions,
  updateContentItemVersion,
} from "./content_item_versions.ts";
import {
  createSchema,
  deleteSchema,
  getSchema,
  listSchemas,
  updateSchema,
} from "./schemas.ts";

const app = createProxyApp("/proxy", "yunocontent");

app.get("/proxy/content_items", async (req: any, res: any) => {
  const options = {
    schemaIds: req.query.schemaIds
      ? (req.query.schemaIds as string).split(",").map(Number)
      : undefined,
    authorIds: req.query.authorIds
      ? (req.query.authorIds as string).split(",").map(Number)
      : undefined,
    status: req.query.status as string | undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
    orderBy: req.query.orderBy as
      | "created_at"
      | "updated_at"
      | "published_at"
      | undefined,
    orderDirection: req.query.orderDirection as "asc" | "desc" | undefined,
  };

  const data = await listContentItems(req.dataClient, options);
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/content_items/:id", async (req: any, res: any) => {
  const data = await getContentItem(req.dataClient, req.params.id);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.post("/proxy/content_items", async (req: any, res: any) => {
  const data = await createContentItem(req.dataClient, req.body);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.delete("/proxy/content_items/:id", async (req: any, res: any) => {
  const data = await deleteContentItem(req.dataClient, req.params.id);

  res.set({ ...corsHeaders });
  res.json(data);
});

// Content Item Versions routes
app.get("/proxy/content_item_versions", async (req: any, res: any) => {
  const options = {
    contentItemId: req.query.contentItemId ? Number(req.query.contentItemId) : undefined,
    schemaId: req.query.schemaId ? Number(req.query.schemaId) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
    orderBy: req.query.orderBy as "created_at" | "id" | undefined,
    orderDirection: req.query.orderDirection as "asc" | "desc" | undefined,
  };

  const data = await listContentItemVersions(req.dataClient, options);
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/content_item_versions/:id", async (req: any, res: any) => {
  const data = await getContentItemVersion(req.dataClient, req.params.id);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.get("/proxy/content_items/:id/versions", async (req: any, res: any) => {
  const options = {
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
  };

  const data = await getContentItemVersionHistory(req.dataClient, req.params.id, options);
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/content_item_versions", async (req: any, res: any) => {
  const data = await createContentItemVersion(req.dataClient, req.body);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.put("/proxy/content_item_versions/:id", async (req: any, res: any) => {
  const data = await updateContentItemVersion(req.dataClient, req.params.id, req.body);
  res.set({ ...corsHeaders });
  res.json(data);
});

app.delete("/proxy/content_item_versions/:id", async (req: any, res: any) => {
  const data = await deleteContentItemVersion(req.dataClient, req.params.id);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.get("/proxy/schemas", async (req: any, res: any) => {
  const data = await listSchemas(req.dataClient);
  res.set({ ...corsHeaders });
  res.json(data);
});

app.get("/proxy/schemas/:id", async (req: any, res: any) => {
  const data = await getSchema(req.dataClient, Number(req.params.id));

  res.set({ ...corsHeaders });
  res.json(data);
});

app.post("/proxy/schemas", async (req: any, res: any) => {
  const data = await createSchema(req.dataClient, req.body);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.put("/proxy/schemas/:id", async (req: any, res: any) => {
  console.log("req.params", req.params);
  const data = await updateSchema(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders });
  res.json(data);
});

app.delete("/proxy/schemas/:id", async (req: any, res: any) => {
  const data = await deleteSchema(req.dataClient, Number(req.params.id));

  res.set({ ...corsHeaders });
  res.json(data);
});

app.listen(8000, () => {
  // Server started
});
