import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ContentSchemaBuilderPage from "./pages/ContentSchemaBuilderPage";
import SchemaEditorPage from "./pages/SchemaEditorPage";
import ContentManagerPage from "./pages/ContentManagerPage";
import ContentItemPage from "./pages/ContentItemPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SettingsAccountPage from "./pages/Settings/SettingsAccountPage";
import SettingsWorkspacesPage from "./pages/Settings/SettingsWorkspacesPage";
import SettingsMembersPage from "./pages/Settings/SettingsMembersPage";
import SettingsDatabasePage from "./pages/Settings/SettingsDatabasePage";
import SettingsBillingPage from "./pages/Settings/SettingsBillingPage";
import AssetsLibraryPage from "./pages/AssetsLibraryPage";
import SignInPage from "./pages/SignInPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ContentSearchPage from "./pages/ContentSearchPage";
// import CommentsPage from "./pages/CommentsPage";
import { AppLayout } from "./components/Layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { WorkspaceProvider } from "@/lib/contexts/WorkspaceContext";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

const AppContent: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFound />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <AppLayout />
              </WorkspaceProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manager" element={<ContentManagerPage />} />
          <Route
            path="/manager/editor/:schemaId/new"
            element={<ContentItemPage />}
          />
          <Route
            path="/manager/editor/:contentId"
            element={<ContentItemPage />}
          />
          <Route path="/builder" element={<ContentSchemaBuilderPage />} />
          <Route
            path="/builder/schemas/:schemaId"
            element={<SchemaEditorPage />}
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/library" element={<AssetsLibraryPage />} />
          <Route path="/settings" element={<SettingsPage />}>
            <Route index element={<Navigate to="account" replace />} />
            <Route path="account" element={<SettingsAccountPage />} />
            <Route path="workspaces" element={<SettingsWorkspacesPage />} />
            <Route path="members" element={<SettingsMembersPage />} />
            <Route path="database" element={<SettingsDatabasePage />} />
            <Route path="billing" element={<SettingsBillingPage />} />
          </Route>
          <Route path="/search" element={<ContentSearchPage />} />
          {/* <Route path="/comments" element={<CommentsPage />} /> */}
        </Route>
      </Routes>
      <Toaster />
    </>
  );
};

const App: React.FC = () => (
  <>
    <div id="radix-portal-root" />
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <SearchProvider>
              <AppContent />
            </SearchProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </>
);

export default App;
