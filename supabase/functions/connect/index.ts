import express from "npm:express";
import cors from "npm:cors";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { SupabaseManagementAPI } from "https://esm.sh/supabase-management-js@0.1.2";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
const SUPACONTENT_API_KEY = "supacontent_api_key";
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

app.use(cors());
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

// app.options("/connect/oauth2", async (req, res) => {
//   return res.status(200).set(corsHeaders).send();
// });

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

// app.options("/connect/oauth2/callback", async (req, res) => {
//   return res.status(200).set(corsHeaders).send();
// });

app.post("/connect/oauth2/callback", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  // Get code verifier from user_data table
  const { data: userData, error: fetchError } = await supabase
    .from("user_data")
    .select("code_verifier")
    .eq("user_id", user.id)
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

  if (!tokens.access_token) {
    return res.status(401).set(corsHeaders).send(tokens.message);
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

  res.set(corsHeaders).send(projects);
});

app.post("/connect/refresh", async (req, res) => {
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

  // Get the user's refresh token
  const { data: connection, error: connectionError } = await supabase
    .from("supabase_connections")
    .select("refresh_token")
    .eq("user_id", user.id)
    .single();

  if (connectionError || !connection || !connection.refresh_token) {
    return res.status(404).set(corsHeaders).send("No refresh token found");
  }

  let tokens: any;
  try {
    // Request new tokens using the refresh token
    const tokenResponse = await fetch(config.tokenUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${btoa(
          `${config.clientId}:${config.clientSecret}`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: connection.refresh_token,
      }),
    });

    tokens = await tokenResponse.json();

    if (!tokenResponse.ok || !tokens.access_token) {
      return res
        .status(401)
        .set(corsHeaders)
        .send(
          "Failed to refresh token: " +
            (tokens.error_description || tokens.message)
        );
    }

    // Calculate expiration timestamp
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    // Update tokens in the database
    const { error: updateError } = await supabase
      .from("supabase_connections")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || connection.refresh_token, // Use new refresh token if provided, otherwise keep the existing one
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      return res
        .status(500)
        .set(corsHeaders)
        .send("Failed to update tokens: " + updateError.message);
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    res
      .status(500)
      .set(corsHeaders)
      .send("Token refresh failed: " + (error.message || "Unknown error"));
  }

  res.set(corsHeaders).json({
    success: true,
  });
});

app.post("/connect/workspace/:workspaceId", async (req, res) => {
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

  const { data: connection } = await supabase
    .from("supabase_connections")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", req.params.workspaceId)
    .eq("user_id", user.id)
    .single();

  console.log({ workspace });

  if (!workspace) {
    return res.status(404).set(corsHeaders).send("Unauthorized");
  }
  const dataUrl = `https://${workspace.project_ref}.supabase.co/rest/v1`;
  if (workspace.api_key) {
    // verify that api key is valid with an OPTIONS request against the data url

    const optionsResult = await fetch(dataUrl, {
      method: "OPTIONS",
      headers: {
        Authorization: `Bearer ${workspace.api_key}`,
        "Content-Type": "application/json",
      },
    });
    console.log("options", { optionsResult });
    if (optionsResult.ok) {
      return res.status(200).set(corsHeaders).send({
        success: true,
      });
    }
  }

  const result = await fetch(
    `https://api.supabase.com/v1/projects/${workspace.project_ref}/api-keys?reveal=true`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const payload = await result.json();
  console.log({ payload });
  const apiKey = payload.find(
    (key: any) => key.name === "SUPACONTENT_API_KEY"
  );
  const serviceRoleKey = payload.find(
    (key: any) => key.name === "service_role"
  );

  // stores api_key in the database if present
  if (apiKey && !workspace.api_key) {
    await supabase
      .from("workspaces")
      .update({ api_key: apiKey.api_key })
      .eq("id", workspace.id);
  } else if (!apiKey) {
    // create the api key
    const result = await fetch(
      `https://api.supabase.com/v1/projects/${workspace.project_ref}/api-keys`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: SUPACONTENT_API_KEY,
          type: "secret",
        }),
      }
    );
    const data = await result.json();
    if (result.ok) {
      // create the secret role key
      const result = await fetch(
        `https://api.supabase.com/v1/projects/${workspace.project_ref}/api-keys`,
      );

      await supabase
      .from("workspaces")
      .update({ api_key: data.api_key })
      .eq("id", workspace.id);

    } else {
      // store the secret role key in the database
      console.log("storing secret role key", { serviceRoleKey });
      await supabase
        .from("workspaces")
        .update({ api_key: serviceRoleKey.api_key })
        .eq("id", workspace.id);
    }
  }

  res.set(corsHeaders).send({ success: true });
});


app.listen(8000, () => {
  // Server started
});
