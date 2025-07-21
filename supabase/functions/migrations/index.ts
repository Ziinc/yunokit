import fs from "node:fs";
import express from "npm:express";
import cors from "npm:cors";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import type { Database } from "../_shared/database.types.ts";

type ConnectionRow =
  Database["public"]["Tables"]["supabase_connections"]["Row"];
type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];
export const dataSbClient = (url: string, apiKey: string) =>
  createClient<Database>(url, apiKey, {
    db: {
      schema: "yunocontent",
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

interface MigrationFile {
  version: string;
  sql: string;
}

const app = express();

app.use(cors());
app.use(express.json());

// Helper function to read migration files from directory
async function readMigrationFiles(): Promise<MigrationFile[]> {
  const migrations: MigrationFile[] = [];

  try {
    const index = await Deno.readTextFile("./yunocontent/index.txt");
    const files = index
      .split("\n")
      .map((file) => file.trim())
      .filter((file) => file !== "");

    console.log('files', files)
    // Read migration files from supabase/migrations directoryfor await (const dirEntry of Deno.readDir("/")) {
    for await (const file of files) {
      const filePath = `./yunocontent/${file}`;
      const content = await Deno.readTextFile(filePath);
      const match = file.match(/^(\d{14})_(.+)\.sql$/);
      console.log('match', match)
      if (match) {
        migrations.push({
          version: match[1],
          sql: content,
        });
      }
    }
    return migrations;
  } catch (error) {
    console.error("Error reading migration files:", error);
  }

  return migrations.sort((a, b) => a.version.localeCompare(b.version));
}

async function executeSql(
  connection: ConnectionRow,
  workspace: WorkspaceRow,
  sql: string
) {
  // Execute SQL via Supabase Management API
  let url = `https://api.supabase.com/v1/projects/${workspace.project_ref}/database/query`;
  let accessToken = connection.access_token;
  if (Deno.env.get("USE_SUPABASE_LOCAL") === "true") {
    url = `http://127.0.0.1:54323/api/platform/pg-meta/default/query`
    accessToken = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  }
  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: sql,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Database query failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

async function addSchemaToPostgrest(
  connection: ConnectionRow,
  workspace: WorkspaceRow
) {
  // Execute SQL via Supabase Management API
  // Get current PostgREST config first
  const configResponse = await fetch(
    `https://api.supabase.com/v1/projects/${workspace.project_ref}/postgrest`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!configResponse.ok) {
    throw new Error(
      `Failed to get PostgREST config: ${configResponse.statusText}`
    );
  }

  const currentConfig = await configResponse.json();
  if (currentConfig.db_schema.includes("yunocontent")) {
    return;
  }
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${workspace.project_ref}/postgrest`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        db_schema: currentConfig.db_schema + ",yunocontent,yunocommunity",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Database query failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

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

  const { data: connection, error: connectionError } = await supabase
    .from("supabase_connections")
    .select("access_token")
    .eq("user_id", user.user.id)
    .single();

  if (connectionError || !connection) {
    return res
      .status(401)
      .set(corsHeaders)
      .send("No valid Supabase connection");
  }

  req.supabaseConnection = connection;

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
  
  if (Deno.env.get("USE_SUPABASE_LOCAL") === "true") {
    req.dataClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
  } else {
    req.dataClient = createClient(
      `https://${workspace.project_ref}.supabase.co`,
      workspace.api_key);
  }

  next();
});

const getPendingMigrations = async (
  connection: ConnectionRow,
  workspace: WorkspaceRow
): Promise<MigrationFile[]> => {
  // Ensure yunocontent schema exists
  await executeSql(
    connection,
    workspace,
    `
    CREATE SCHEMA IF NOT EXISTS yunocontent;
    CREATE SCHEMA IF NOT EXISTS yunocommunity;
    CREATE TABLE IF NOT EXISTS yunocontent.schema_migrations (
      version bigint NOT NULL, 
      inserted_at timestamp with time zone DEFAULT now() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS yunocommunity.schema_migrations (
      version bigint NOT NULL, 
      inserted_at timestamp with time zone DEFAULT now() NOT NULL
    );
    `
  );

  await addSchemaToPostgrest(connection, workspace);

  // Fetch applied migrations
  const { data: appliedMigrations } = await executeSql(
    connection,
    workspace,
    `SELECT * FROM yunocontent.schema_migrations ORDER BY version ASC`
  );

  // Read migration files
  const migrations = await readMigrationFiles();

  // Compare and return pending migrations
  const appliedVersions = new Set(
    appliedMigrations?.map((m) => m.version) || []
  );

  return migrations.filter((m) => !appliedVersions.has(m.version));
};

// Get a list of migration versions that are pending
app.get("/migrations/pending", async (req: any, res: any) => {
  try {
    const pendingMigrations = await getPendingMigrations(
      req.supabaseConnection,
      req.workspace
    );

    console.log("pendingMigrations", pendingMigrations.length);
    res
      .set(corsHeaders)
      .json({ versions: pendingMigrations.map((m) => m.version) });
  } catch (error) {
    res.status(500).set(corsHeaders).json({ error: error.message });
  }
});

// Run all pending migrations
app.post("/migrations/:schema", async (req: any, res: any) => {
  try {
    const schema = req.params.schema;
    if (!["yunocontent", "yunocommunity"].includes(schema)) {
      return res.status(400).set(corsHeaders).json({ error: "Invalid schema" });
    }
    const pendingMigrations = await getPendingMigrations(
      req.supabaseConnection,
      req.workspace
    );

    console.log("pendingMigrations", pendingMigrations.length);
    const results = [];

    for (const migration of pendingMigrations) {
      // Execute the migration SQL
      const sqlResult = await executeSql(
        req.supabaseConnection,
        req.workspace,
        migration.sql + `; INSERT INTO ${schema}.schema_migrations (version) VALUES (${migration.version});`
      );

      if (sqlResult.error) {
        throw new Error("Failed to execute migration: " + sqlResult.error);
      }
      console.log("Applied migration " + migration.version + " successfully");
    }

    res.set(corsHeaders).json({ result: "success" });
  } catch (error) {
    res.status(500).set(corsHeaders).json({ error: error.message });
  }
});

app.listen(8000, () => {
  // Server started
});