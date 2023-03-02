import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

interface Options {
  directory: string;
}
export const migrations = async (rawOptions: Partial<Options>) => {
  const opts: Options = Object.assign(
    { directory: "supabase/migrations" },
    rawOptions
  );

  if (!fs.existsSync(opts.directory)) {
    console.log(`Directory ${opts.directory} does not exist. Creating...`);
    fs.mkdirSync(opts.directory, { recursive: true });
  }

  const migrationsOriginPath = path.join(__dirname, "migrations");
  const existingMigrations = findAllMigrations(opts.directory).filter(
    (migration) => migration.hasPrefix
  );
  const existingMigrationNames = existingMigrations.map(
    (migration) => migration.name
  );
  const migrationsToCreate = findAllMigrations(migrationsOriginPath).filter(
    (migration) => !existingMigrationNames.includes(migration.name)
  );

  // exit early if no new migrations
  if (migrationsToCreate.length === 0) {
    console.log("No new migrations detected. Exiting.");
    return;
  }

  console.log("Creating migrations in " + opts.directory + " ...");

  const now = Number(dayjs.utc().format("YYYYMMDDHHmmss"));
  // create each file
  let created = 0;
  migrationsToCreate.forEach((migration) => {
    const timestamp = now + migration.index;
    const destfilename = `${timestamp}_supacontent_${migration.name}.sql`;
    const destpath = path.join(opts.directory, destfilename);
    fs.copyFile(migration.filepath, destpath, (err) => {
      if (err) throw err;
      console.log(`Migration created: ${destfilename}`);
      created += 1;
    });
  });

  console.log(`${created} migrations created.`);
};

// detect all migration files in a directory
const findAllMigrations = (dir: string) => {
  return fs.readdirSync(dir).map((filename, index) => {
    const regexp = /[0-9]+(_supacontent)?_(.+)\.sql/g;
    const array = [...filename.matchAll(regexp)];
    const hasPrefix = !!array[0][1];
    const name = array[0][2];
    const filepath = path.join(dir, filename);
    return {
      index,
      hasPrefix,
      name,
      filename,
      filepath,
    };
  });
};

export default migrations;
