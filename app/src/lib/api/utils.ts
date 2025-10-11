type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined;

interface BuildApiUrlOptions {
  path?: string | number | Array<string | number>;
  query?: Record<string, QueryValue>;
  workspaceId?: number;
}

/**
 * Builds a standardized API URL with optional path segments and query params.
 * - Appends `workspaceId` when provided and is a number
 * - Encodes path segments safely
 * - Joins array query values with commas to match existing API expectations
 */
export function buildApiUrl(base: string, opts?: BuildApiUrlOptions): string {
  const segments: string[] = [base.replace(/\/+$/, "")];

  if (opts?.path !== undefined) {
    const pathParts = Array.isArray(opts.path) ? opts.path : [opts.path];
    for (const seg of pathParts) {
      if (seg === undefined || seg === null || seg === "") continue;
      segments.push(encodeURIComponent(String(seg)));
    }
  }

  const fullPath = segments.join("/");

  const qp = new URLSearchParams();

  if (typeof opts?.workspaceId === "number" && Number.isFinite(opts.workspaceId)) {
    qp.set("workspaceId", String(opts.workspaceId));
  }

  if (opts?.query) {
    for (const [key, raw] of Object.entries(opts.query)) {
      if (raw === undefined || raw === null) continue;
      if (Array.isArray(raw)) {
        const values = raw
          .filter((v) => v !== undefined && v !== null)
          .map((v) => String(v));
        if (values.length > 0) qp.set(key, values.join(","));
      } else {
        qp.set(key, String(raw));
      }
    }
  }

  const qs = qp.toString();
  return qs ? `${fullPath}?${qs}` : fullPath;
}
