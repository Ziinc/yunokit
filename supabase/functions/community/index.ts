import express from "npm:express";
import cors from "npm:cors";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  listForums,
  getForum,
  createForum,
  updateForum,
  deleteForum,
} from "./forums.ts";
import { listPosts, getPost, createPost, updatePost, deletePost } from "./posts.ts";
import { listComments, getComment, createComment, updateComment, deleteComment } from "./comments.ts";
import { listBans, banUser, updateBan, unbanUser } from "./moderation.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    db: {
      schema: "public",
    },
  }
);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/community", async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).set(corsHeaders).send("Unauthorized");
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: user, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).set(corsHeaders).send("Unauthorized");
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", req.query.workspaceId as string)
    .eq("user_id", user.user.id)
    .single();

  if (workspaceError || !workspace) {
    return res.status(401).set(corsHeaders).send("Unauthorized");
  }

  req.user = user.user;
  req.workspace = workspace;
  if (Deno.env.get("USE_SUPABASE_LOCAL") === "true") {
    req.dataClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        db: { schema: "yunocommunity" },
      }
    );
  } else {
    req.dataClient = createClient(
      `https://${workspace.project_ref}.supabase.co`,
      workspace.api_key,
      {
        db: { schema: "yunocommunity" },
      }
    );
  }
  next();
});

app.get("/community/forums", async (req: any, res: any) => {
  const data = await listForums(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});

app.get("/community/forums/:id", async (req: any, res: any) => {
  const data = await getForum(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.post("/community/forums", async (req: any, res: any) => {
  const data = await createForum(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.put("/community/forums/:id", async (req: any, res: any) => {
  const data = await updateForum(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.delete("/community/forums/:id", async (req: any, res: any) => {
  const data = await deleteForum(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.get("/community/posts", async (req: any, res: any) => {
  const data = await listPosts(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});
app.get("/community/posts/:id", async (req: any, res: any) => {
  const data = await getPost(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});
app.post("/community/posts", async (req: any, res: any) => {
  const data = await createPost(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});
app.put("/community/posts/:id", async (req: any, res: any) => {
  const data = await updatePost(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders }).json(data);
});
app.delete("/community/posts/:id", async (req: any, res: any) => {
  const data = await deletePost(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.get("/community/comments", async (req: any, res: any) => {
  const data = await listComments(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});
app.get("/community/comments/:id", async (req: any, res: any) => {
  const data = await getComment(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});
app.post("/community/comments", async (req: any, res: any) => {
  const data = await createComment(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});
app.put("/community/comments/:id", async (req: any, res: any) => {
  const data = await updateComment(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders }).json(data);
});
app.delete("/community/comments/:id", async (req: any, res: any) => {
  const data = await deleteComment(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.get("/community/bans", async (req: any, res: any) => {
  const data = await listBans(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});
app.post("/community/bans", async (req: any, res: any) => {
  const data = await banUser(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});
app.put("/community/bans/:id", async (req: any, res: any) => {
  const data = await updateBan(req.dataClient, Number(req.params.id), req.body);
  res.set({ ...corsHeaders }).json(data);
});
app.delete("/community/bans/:id", async (req: any, res: any) => {
  const data = await unbanUser(req.dataClient, Number(req.params.id));
  res.set({ ...corsHeaders }).json(data);
});

app.listen(8000, () => {});
