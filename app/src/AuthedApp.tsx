import { Routes, Route } from "react-router-dom";
import BaseLayout from "./layouts/BaseLayout";
import ContentPage from "./pages/ContentPage";
import SettingsPage from "./pages/SettingsPage";
import ListContent from "./pages/content/ListContent";
import ShowProject from "./pages/ShowProject";
import ContentTypesPage from "./pages/ContentTypesPage";
import ContentTypesOnboarding from "./interfaces/ContentTypes/ContentTypesOnboarding";
import NewProjectPage from "./pages/NewProjectPage";
import ProjectSettingsPage from "./pages/ProjectSettingsPage";
import NewContentType from "./pages/NewContentType";
import ShowContentType from "./pages/ShowContentType";
import ShowContent from "./pages/ShowContent";
import ListProjectsPage from "./pages/projects/ListProjectsPage";
import { Auth } from "@supabase/auth-ui-react";
import { AppContext, } from "./utils";
import useSWR from "swr";
import { listProjects } from "./api";

const AuthedApp: React.FC = () => {
  const authData = Auth.useUser();

  const {
    data: projectsData,
    mutate: refreshProjects,
    isValidating: isLoadingProjects,
  } = useSWR("projects", listProjects);
  return (
    <AppContext.Provider
      value={{
        projects: projectsData?.data,
        refreshProjects,
        isLoadingProjects,
        user: authData?.user,
        session: authData?.session,
      }}
    >
      <Routes>
        <Route path="/" element={<ListProjectsPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:project_id" element={<BaseLayout />}>
          <Route index element={<ShowProject />} />
          <Route path="settings" element={<ProjectSettingsPage />} />
          <Route path="content" element={<ContentPage />}>
            <Route index element={<ListContent />} />
            <Route path="type/:content_type_id" element={<ListContent />} />
            <Route
              path="type/:content_type_id/edit/:content_id"
              element={<ShowContent />}
            />
          </Route>
          <Route path="content-types" element={<ContentTypesPage />}>
            <Route path="new" element={<NewContentType />} />
            <Route path=":content_type_id" element={<ShowContentType />} />
            <Route index element={<ContentTypesOnboarding />} />
          </Route>
        </Route>
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AppContext.Provider>
  );
};

export default AuthedApp;
