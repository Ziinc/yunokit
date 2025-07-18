import express from "npm:express";
import cors from "npm:cors";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const allowedSchemas = ["yunocontent", "yunofeedback"] as const;
import {
  createContentItem,
  deleteContentItem,
  getContentItem,
  listContentItems,
} from "./content_items.ts";
import {
  listIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} from "./feedback_issues.ts";
import { createVote, deleteVote } from "./feedback_votes.ts";
import {
  listTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  addTicketComment,
  listTicketComments,
} from "./feedback_tickets.ts";
import integrationHandler from "./feedback_integration.ts";
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

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    db: {
      schema: "public",
    },
  },
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
  const schema =
    typeof req.query.schema === "string" &&
    allowedSchemas.includes(req.query.schema)
      ? req.query.schema
      : "yunocontent";
  req.schema = schema;
  if (Deno.env.get("USE_SUPABASE_LOCAL") === "true") {
    req.dataClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        db: {
          schema,
        },
      },
    );
  } else {
    req.dataClient = createClient(
      `https://${workspace.project_ref}.supabase.co`,
      workspace.api_key,
      {
        db: {
          schema,
        },
      },
    );
  }

  next();
});

app.get("/proxy/content_items", async (req: any, res: any) => {
  const data = await listContentItems(req.dataClient);
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

// Feedback Issues

app.get("/proxy/feedback/issues", async (req: any, res: any) => {
  const data = await listIssues(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/feedback/issues", async (req: any, res: any) => {
  const data = await createIssue(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.put("/proxy/feedback/issues/:id", async (req: any, res: any) => {
  const data = await updateIssue(req.dataClient, req.params.id, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.delete("/proxy/feedback/issues/:id", async (req: any, res: any) => {
  const data = await deleteIssue(req.dataClient, req.params.id);
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/feedback/votes", async (req: any, res: any) => {
  const data = await createVote(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.delete("/proxy/feedback/votes/:id", async (req: any, res: any) => {
  const data = await deleteVote(req.dataClient, req.params.id);
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/feedback/tickets", async (req: any, res: any) => {
  const data = await listTickets(req.dataClient);
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/feedback/tickets", async (req: any, res: any) => {
  const data = await createTicket(req.dataClient, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.put("/proxy/feedback/tickets/:id", async (req: any, res: any) => {
  const data = await updateTicket(req.dataClient, req.params.id, req.body);
  res.set({ ...corsHeaders }).json(data);
});

app.delete("/proxy/feedback/tickets/:id", async (req: any, res: any) => {
  const data = await deleteTicket(req.dataClient, req.params.id);
  res.set({ ...corsHeaders }).json(data);
});

app.get("/proxy/feedback/tickets/:id/comments", async (req: any, res: any) => {
  const data = await listTicketComments(req.dataClient, req.params.id);
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/feedback/tickets/:id/comments", async (req: any, res: any) => {
  const data = await addTicketComment(req.dataClient, {
    ...req.body,
    ticket_id: req.params.id,
  });
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/feedback/integrations", integrationHandler);

// Content Item Versions routes
app.get("/proxy/content_item_versions", async (req: any, res: any) => {
  const options = {
    contentItemId: req.query.contentItemId
      ? Number(req.query.contentItemId)
      : undefined,
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

  const data = await getContentItemVersionHistory(
    req.dataClient,
    req.params.id,
    options,
  );
  res.set({ ...corsHeaders }).json(data);
});

app.post("/proxy/content_item_versions", async (req: any, res: any) => {
  const data = await createContentItemVersion(req.dataClient, req.body);

  res.set({ ...corsHeaders });
  res.json(data);
});

app.put("/proxy/content_item_versions/:id", async (req: any, res: any) => {
  const data = await updateContentItemVersion(
    req.dataClient,
    req.params.id,
    req.body,
  );
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
  const data = await updateSchema(
    req.dataClient,
    Number(req.params.id),
    req.body,
  );
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
