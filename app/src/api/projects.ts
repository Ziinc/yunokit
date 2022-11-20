import { Project } from "../types";
import { client, supacontent } from "../utils";

export const listProjects = async () => {
  return await client.from("projects").select<"projects", Project>();
};

export const createProject = async (attrs: Partial<Project>) => {
  return await client
    .from("projects")
    .insert(attrs)
    .select<"projects", Project>();
};

export const isSchemaExposed = async (project) => {
  const { error } = await supacontent(project)
    .from("content")
    .select("*")
    .limit(1);
  if (
    error &&
    error.message &&
    error.message.includes("must be one of the following")
  ) {
    return false;
  } else {
    return true;
  }
};
export const isContentTablePresent = async (project) => {
  const { error } = await supacontent(project)
    .from("content")
    .select("*")
    .limit(1);
  if (error && error.message && error.message.includes("does not exist")) {
    return false;
  } else {
    return true;
  }
};
