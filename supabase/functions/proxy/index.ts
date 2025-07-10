import express from "npm:express";
import cors from "npm:cors";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  createContentItem,
  deleteContentItem,
  getContentItem,
  listContentItems,
} from "./content_items.ts";
import {
  createSchema,
  deleteSchema,
  getSchema,
  listSchemas,
  updateSchema,
} from "./schemas.ts";
import { dataSbClient } from "./_utils.ts";

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

// Application-level middleware for all /proxy routes
app.use("/proxy", async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).set(corsHeaders).send("Unauthorized");
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: user, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).set(corsHeaders).send("Unauthorized");
  }

  // check if user owns the workspace
  console.log("req.query.workspaceId", req.query.workspaceId);
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", req.query.workspaceId as string)
    .eq("user_id", user.user.id)
    .single();
  console.log("workspace", workspace);

  if (workspaceError || !workspace) {
    return res.status(401).set(corsHeaders).send("Unauthorized");
  }

  // Attach user and workspace to request for use in route handlers
  req.user = user.user;
  req.workspace = workspace;
  if (Deno.env.get("USE_SUPABASE_LOCAL") === "true") {
    req.dataClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        db: {
          schema: "yunocontent",
        },
      }
    );
  } else {
    req.dataClient = createClient(
      `https://${workspace.project_ref}.supabase.co`,
      workspace.api_key,
      {
        db: {
          schema: "yunocontent",
        },
      }
    );
  }

  next();
});

app.get("/proxy/content_items", async (req: any, res: any) => {
  const result = await listContentItems(req.dataClient);
  console.log("result", result);
  res.set({ ...corsHeaders }).json(result.data);
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
