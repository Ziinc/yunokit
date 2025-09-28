import fs from "fs";
import path from "path";

export type Migration = {
  version: string
  name: string
  schema: "yunocontent" | "yunocommunity"
  filename: string
  sql: string
  workspace: string
}

// @ts-ignore
export const migrations: Migration[] = compileTime(async () => {
  const results: Migration[] = []
  // Read supabase/migrations directly
  const supabaseMigrationsPath = path.resolve(
    __dirname,
    "../../supabase/migrations"
  );
  if (fs.existsSync(supabaseMigrationsPath)) {
    (["yunocontent", "yunocommunity"] as Migration["schema"][]).forEach((schema: Migration["schema"]) => {
      const files = fs
        .readdirSync(path.join(supabaseMigrationsPath, schema))
        .filter((file) => file.endsWith(".sql"))
      .sort();

      for (const file of files) {
        if (typeof file === "string") {
          const filePath = path.join(supabaseMigrationsPath, schema, file);
          const content = fs.readFileSync(filePath, "utf8");
          const match = file.match(/^(\d{14})_(.+)\.sql$/);

          if (match) {
            results.push({
              version: match[1],
              name: match[2],
              filename: `supabase/migrations/${schema}/${file}`,
              sql: content,
              schema,
              workspace: "supabase",
            })
          }
        }
      }
    })
  }
  return results;
});
