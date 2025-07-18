import { corsHeaders } from "../_shared/cors.ts";

export const triggerIntegration = async (
  type: string,
  payload: Record<string, unknown>,
) => {
  const url = Deno.env.get(`INTEGRATION_${type.toUpperCase()}_URL`);
  if (!url) {
    console.log(`No integration url for ${type}`);
    return { ok: true };
  }
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  return { ok: res.ok };
};

export default async (req: any, res: any) => {
  const { type, payload } = req.body as {
    type: string;
    payload: Record<string, unknown>;
  };
  const data = await triggerIntegration(type, payload);
  res.set({ ...corsHeaders }).json(data);
};
