import express from "npm:express";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { SupabaseManagementAPI } from "https://esm.sh/supabase-management-js@0.1.2";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const config = {
  clientId: Deno.env.get("SB_OAUTH_CLIENT_ID")!,
  clientSecret: Deno.env.get("SB_OAUTH_CLIENT_SECRET")!,
  authorizationEndpointUri: "https://api.supabase.com/v1/oauth/authorize",
  tokenUri: "https://api.supabase.com/v1/oauth/token",
  redirectUri: null,
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const app = express();

app.use(express.json());

const managementClient = async (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw new Error("Invalid token");
  }

  // Store tokens in supabase_connections
  const { data: connection } = await supabase
    .from("supabase_connections")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  if (!connection || !connection.access_token) {
    throw new Error("No connection found");
  }

  const supaManagementClient = new SupabaseManagementAPI({
    accessToken: connection.access_token,
  });
  return supaManagementClient;
};

app.options("/connect/*", async (req, res) => {
  return res.status(200).set(corsHeaders).send();
});

app.options("/connect/oauth2", async (req, res) => {
  return res.status(200).set(corsHeaders).send();
});

app.get("/connect/oauth2", async (req, res) => {
  if (req.method === "OPTIONS") {
    return res.status(200).set(corsHeaders).send();
  }

  // Get user ID from auth header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).set(corsHeaders).send("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).set(corsHeaders).send("Invalid token");
  }

  const oauth2Client = new OAuth2Client({
    ...config,
    redirectUri: req.headers["sc-redirect-uri"],
  });
  const { uri, codeVerifier } = await oauth2Client.code.getAuthorizationUri();

  // Store code verifier in user_data table
  const { error } = await supabase
    .from("user_data")
    .upsert(
      { user_id: user.id, code_verifier: codeVerifier },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Error storing code verifier:", error);
    return res.status(500).set(corsHeaders).send("Error storing code verifier");
  }

  res.set({ ...corsHeaders });
  res.json({ uri: uri.toString() });
});

app.options("/connect/oauth2/callback", async (req, res) => {
  return res.status(200).set(corsHeaders).send();
});

app.post("/connect/oauth2/callback", async (req, res) => {
  // Get code verifier from user_data table
  const { data: userData, error: fetchError } = await supabase
    .from("user_data")
    .select("code_verifier")
    .single();

  if (fetchError || !userData?.code_verifier) {
    console.error("Error fetching code verifier:", fetchError);
    return res
      .status(500)
      .set(corsHeaders)
      .send("Error fetching code verifier");
  }

  const tokens = await fetch(config.tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${btoa(
        `${config.clientId}:${config.clientSecret}`
      )}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: req.body.code as string,
      redirect_uri: req.headers["sc-redirect-uri"],
      code_verifier: userData.code_verifier,
    }),
  })
    .then((res) => res.json())
    .catch(console.error);
  console.log("tokens", tokens);

  // Get user ID from auth header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).set(corsHeaders).send("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).set(corsHeaders).send("Invalid token");
  }

  // Store tokens in supabase_connections
  const expiresAt = Date.now() + tokens.expires_in;
  await supabase.from("supabase_connections").upsert(
    {
      user_id: user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
    },
    { onConflict: "user_id" }
  );

  // Clear code verifier after use
  await supabase.from("user_data").update({ code_verifier: null });

  const supaManagementClient = new SupabaseManagementAPI({
    accessToken: tokens.accessToken ?? tokens.access_token,
  });
  const projects = await supaManagementClient.getProjects();

  console.log("projects", projects);
  res.set(corsHeaders).send(projects);
});

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
