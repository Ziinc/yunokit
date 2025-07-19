import { createProxyApp } from "../proxy/app.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  listForums,
  getForum,
  createForum,
  updateForum,
  deleteForum,
  archiveForum,
} from "./forums.ts";
import { listPosts, getPost, createPost, updatePost, deletePost } from "./posts.ts";
import { listComments, getComment, createComment, updateComment, deleteComment } from "./comments.ts";
import { listBans, banUser, updateBan, unbanUser } from "./moderation.ts";

const app = createProxyApp("/proxy/community", "yunocommunity");

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

app.get("/proxy/community/bans", async (req: any, res: any) => {
  const data = await listBans(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});
app.post("/proxy/community/bans", async (req: any, res: any) => {
  const data = await banUser(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});
app.put("/proxy/community/bans/:id", async (req: any, res: any) => {
  const data = await updateBan(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders }).json(data);
});
app.delete("/proxy/community/bans/:id", async (req: any, res: any) => {
  const data = await unbanUser(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.listen(8000, () => {});
