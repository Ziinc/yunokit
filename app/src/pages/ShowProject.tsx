import { useEffect, useState } from "react";
import { isContentTablePresent, isSchemaExposed } from "../api";
import { useCurrentProject } from "../utils";

const ShowProject = () => {
  const [checks, setChecks] = useState({
    schemaExposed: false,
    ranMigrations: false,
  });
  const project = useCurrentProject();
  useEffect(() => {
    checkSchemaExposed();
    checkMigrationsRun();
  }, []);

  const checkSchemaExposed = async () => {
    const schemaExposed = await isSchemaExposed(project);
    setChecks((prev) => ({ ...prev, schemaExposed }));
  };

  const checkMigrationsRun = async () => {
    const result = await isContentTablePresent(project)
      setChecks((prev) => ({ ...prev, ranMigrations: result }));
  };

  return (
    <div className="flex flex-col gap-4">
      <span>
        Show project Supacontent schema has been exposed:{" "}
        {String(checks.schemaExposed)}
      </span>
      <span>Ran migrations: {String(checks.ranMigrations)}</span>
    </div>
  );
};

export default ShowProject;
