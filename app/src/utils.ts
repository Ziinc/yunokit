import { AuthSession, AuthUser, createClient } from "@supabase/supabase-js";
import { useParams } from "react-router";
import { SUPABASE_API_KEY, SUPABASE_API_URL } from "./constants";
import { createContext, useContext } from "react";
import { Project } from "./types";

export const client = createClient(SUPABASE_API_URL, SUPABASE_API_KEY);
export const supacontent = (project: Project) =>
  createClient(project.api_url, project.service_role_key, {
    db: { schema: "supacontent" } as any,
  });

export const randomString = (num = 7) =>
  (Math.random() + 1).toString(36).substring(num);

export const useCurrentProject = () => {
  const { project_id } = useParams();
  const { projects } = useAppContext();
  return (projects || []).find((p) => String(p.id) === String(project_id));
};

export interface IAppContext {
  projects: Project[] | null;
  user: AuthUser;
  session: AuthSession;
  refreshProjects: () => void;
  isLoadingProjects: boolean;
}
export const AppContext = createContext<IAppContext>({
  projects: null,
  user: null,
  session: null,
  refreshProjects: () => null,
  isLoadingProjects: false,
});
export const useAppContext = () => useContext(AppContext);
