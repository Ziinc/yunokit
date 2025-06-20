import express from "npm:express";
import cors from "npm:cors";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import type { Database } from "../_shared/database.types.ts";

export const dataSbClient = (url: string, apiKey: string) =>
  createClient<Database>(url, apiKey, {
    db: {
      schema: "supacontent",
    },
  });

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

app.use("/migrations", async (req: any, res: any, next: any) => {
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
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", req.query.workspaceId as string)
    .eq("user_id", user.user.id)
    .single();

  if (workspaceError || !workspace) {
    return res.status(401).set(corsHeaders).send("Unauthorized");
  }

  // Attach user and workspace to request for use in route handlers
  req.user = user.user;
  req.workspace = workspace;
  req.dataClient = createClient(
    `https://${workspace.project_ref}.supabase.co`,
    workspace.api_key,
    {
      db: {
        schema: "supacontent",
      },
    }
  );

  next();
});

app.get("/migrations/check", async (req: any, res: any) => {
  // TODO: Implement migration status check logic
  res.set({ ...corsHeaders }).json({ message: "Migration check endpoint" });
});

app.post("/migrations/up", async (req: any, res: any) => {
  // TODO: Implement migration up logic
  res.set({ ...corsHeaders }).json({ message: "Migration up endpoint" });
});

// run a migration up to a certain version
app.post("/migrations/up/:id", async (req: any, res: any) => {
    // TODO: Implement migration up logic
    res.set({ ...corsHeaders }).json({ message: "Migration up endpoint" });
  });
  

app.post("/migrations/down", async (req: any, res: any) => {
  // TODO: Implement migration down logic
  res.set({ ...corsHeaders }).json({ message: "Migration down endpoint" });
});

app.listen(8000, () => {
  // Server started
});
