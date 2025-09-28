import { createClient, PostgrestResponse } from "npm:@supabase/supabase-js@2.39.3";
import type { Database } from "../_shared/database.types.ts";
import express from "npm:express";
import cors from "npm:cors";
import { corsHeaders } from "../_shared/cors.ts";


// Extract context from request path and determine schema
enum ContextToSchema {
  community = "yunocommunity",
  content = "yunocontent"
}

export const createProxyApp = () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { db: { schema: "public" } }
  );

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/proxy/:context", async (req: any, res: any, next: any) => {
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
    
    const context = req.params.context;
    
    if (!Object.keys(ContextToSchema).includes(context)) {
      return res.status(400).set(corsHeaders).send("Bad request: invalid context");
    }
    
    const schema: ContextToSchema = ContextToSchema[context as keyof typeof ContextToSchema];

    console.log('schema', schema)
    req.user = user.user;
    req.workspace = workspace;
    req.schema = schema;
    
    if (Deno.env.get("USE_SUPABASE_LOCAL") === "true") {
      req.dataClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { db: { schema } }
      );
    } else {
      req.dataClient = createClient(
        `https://${workspace.project_ref}.supabase.co`,
        workspace.api_key,
        { db: { schema } }
      );
    }
    next();
  });

  return app;
};

export const dataSbClient = (url: string, apiKey: string, schema: "yunocontent" | "yunocommunity" = "yunocontent") =>
  createClient<Database>(url, apiKey, {
    db: {
      schema,
    },
  });

export const handleResponse =  (res : PostgrestResponse<unknown>) => {
  if (res.error){
    console.error(`${res.error.code}: ${res.error.message} - ${res.error.details} - ${res.error.hint}`);
    throw `${res.error.code}: ${res.error.message}`;
  }
  return res.data;
};