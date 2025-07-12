import fs from "fs";
import path from "path";

export type Migration = {
  version: string
  name: string
  filename: string
  sql: string
  workspace: string
}

export const migrations: Migration[] = compileTime(async () => {
  const results: Migration[] = []
  // Read supabase/migrations directly
  const supabaseMigrationsPath = path.resolve(
    __dirname,
    "../../supabase/migrations"
  );
  if (fs.existsSync(supabaseMigrationsPath)) {
    const files = fs
      .readdirSync(supabaseMigrationsPath)
      .filter((file) => file.endsWith(".sql"))
      .sort();


    for (const file of files) {
      if (typeof file === "string") {
        const filePath = path.join(supabaseMigrationsPath, file);
        const content = fs.readFileSync(filePath, "utf8");
        const match = file.match(/^(\d{14})_(.+)\.sql$/);

        if (match) {
          results.push({
            version: match[1],
            name: match[2],
            filename: `supabase/migrations/${file}`,
            sql: content,
            workspace: "supabase",
          })
        }
      }
    }
  }
  return results;
});
