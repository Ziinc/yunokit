import { corsHeaders } from "../_shared/cors.ts";
import {
  createContentItem,
  deleteContentItem,
  getContentItem,
  listContentItems,
} from "./content/content_items.ts";
import {
  createContentItemVersion,
  deleteContentItemVersion,
  getContentItemVersion,
  getContentItemVersionHistory,
  listContentItemVersions,
  updateContentItemVersion,
} from "./content/content_item_versions.ts";
import {
  createSchema,
  deleteSchema,
  getSchema,
  listSchemas,
  updateSchema,
} from "./schemas.ts";
import {
  listForums,
  getForum,
  createForum,
  updateForum,
  deleteForum,
  archiveForum,
} from "./community/forums.ts";
import { listPosts, getPost, createPost, updatePost, deletePost } from "./posts.ts";
import { listComments, getComment, createComment, updateComment, deleteComment } from "./community/comments.ts";
import { createProxyApp } from "./_utils.ts";

const app = createProxyApp();

// Updated routes with dynamic schema pattern using context
app.get("/proxy/:context/content_items", async (req: any, res: any) => {
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

app.get("/proxy/:context/content_items/:id", async (req: any, res: any) => {
  const data = await getContentItem(req.dataClient, req.params.id);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.post("/proxy/:context/content_items", async (req: any, res: any) => {
  const data = await createContentItem(req.dataClient, req.body);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.delete("/proxy/:context/content_items/:id", async (req: any, res: any) => {
  const data = await deleteContentItem(req.dataClient, req.params.id);

  res.set({ ...corsHeaders });
  res.json(data);
});

// Content Item Versions routes with dynamic context
app.get("/proxy/:context/content_item_versions", async (req: any, res: any) => {
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

app.get("/proxy/:context/content_item_versions/:id", async (req: any, res: any) => {
  const data = await getContentItemVersion(req.dataClient, req.params.id);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.get("/proxy/:context/content_items/:id/versions", async (req: any, res: any) => {
  const options = {
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
  };

  const data = await getContentItemVersionHistory(req.dataClient, req.params.id, options);
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/:context/content_item_versions", async (req: any, res: any) => {
  const data = await createContentItemVersion(req.dataClient, req.body);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.put("/proxy/:context/content_item_versions/:id", async (req: any, res: any) => {
  const data = await updateContentItemVersion(req.dataClient, req.params.id, req.body);
  res.set({ ...corsHeaders });
  res.json(data);
});

app.delete("/proxy/:context/content_item_versions/:id", async (req: any, res: any) => {
  const data = await deleteContentItemVersion(req.dataClient, req.params.id);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.get("/proxy/:context/schemas", async (req: any, res: any) => {
  const data = await listSchemas(req.dataClient);
  res.set({ ...corsHeaders });
  res.json(data);
});

app.get("/proxy/:context/schemas/:id", async (req: any, res: any) => {
  const data = await getSchema(req.dataClient, Number(req.params.id));

  res.set({ ...corsHeaders });
  res.json(data);
});

app.post("/proxy/:context/schemas", async (req: any, res: any) => {
  const data = await createSchema(req.dataClient, req.body);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.put("/proxy/:context/schemas/:id", async (req: any, res: any) => {
  const data = await updateSchema(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders });
  res.json(data);
});

app.delete("/proxy/:context/schemas/:id", async (req: any, res: any) => {
  const data = await deleteSchema(req.dataClient, Number(req.params.id));

  res.set({ ...corsHeaders });
  res.json(data);
});

// Community routes
app.get("/proxy/community/forums", async (req: any, res: any) => {
  const data = await listForums(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/community/forums/:id", async (req: any, res: any) => {
  const data = await getForum(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/community/forums", async (req: any, res: any) => {
  const data = await createForum(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.put("/proxy/community/forums/:id", async (req: any, res: any) => {
  const data = await updateForum(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/community/forums/:id/archive", async (req: any, res: any) => {
  const data = await archiveForum(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.delete("/proxy/community/forums/:id", async (req: any, res: any) => {
  const data = await deleteForum(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/community/posts", async (req: any, res: any) => {
  const data = await listPosts(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/community/posts/:id", async (req: any, res: any) => {
  const data = await getPost(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/community/posts", async (req: any, res: any) => {
  const data = await createPost(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.put("/proxy/community/posts/:id", async (req: any, res: any) => {
  const data = await updatePost(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.delete("/proxy/community/posts/:id", async (req: any, res: any) => {
  const data = await deletePost(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/community/comments", async (req: any, res: any) => {
  const data = await listComments(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/community/comments/:id", async (req: any, res: any) => {
  const data = await getComment(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/community/comments", async (req: any, res: any) => {
  const data = await createComment(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.put("/proxy/community/comments/:id", async (req: any, res: any) => {
  const data = await updateComment(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.delete("/proxy/community/comments/:id", async (req: any, res: any) => {
  const data = await deleteComment(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.listen(8000, () => {
  // Server started
});
