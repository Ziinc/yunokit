import { Suspense, lazy, type FC } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from 'lucide-react';
const NotFound = lazy(() => import("./pages/NotFound"));
const ContentSchemaBuilderPage = lazy(() => import("./pages/ContentSchemaBuilderPage"));
const SchemaEditorPage = lazy(() => import("./pages/SchemaEditorPage"));
const ContentManagerPage = lazy(() => import("./pages/ContentManagerPage"));
const ContentItemPage = lazy(() => import("./pages/ContentItemPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SettingsAccountPage = lazy(() => import("./pages/Settings/SettingsAccountPage"));
const SettingsWorkspacesPage = lazy(() => import("./pages/Settings/SettingsWorkspacesPage"));
const SettingsMembersPage = lazy(() => import("./pages/Settings/SettingsMembersPage"));
const SettingsDatabasePage = lazy(() => import("./pages/Settings/SettingsDatabasePage"));
const SettingsBillingPage = lazy(() => import("./pages/Settings/SettingsBillingPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const ForumManagementPage = lazy(() => import("./pages/ForumManagementPage"));
const ForumDetailPage = lazy(() => import("./pages/ForumDetailPage"));
const NewPostPage = lazy(() => import("./pages/NewPostPage"));
const PostCommentsPage = lazy(() => import("./pages/PostCommentsPage"));
import { AppLayout } from "./components/Layout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/lib/contexts/WorkspaceContext";
import { ThemeProvider } from "@/components/theme-provider";
const Dashboard = lazy(() => import("./pages/Dashboard"));

const LoadingScreen: FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AppContent: FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Suspense fallback={null}>
        <Routes>
          {/* Public Routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFound />} />

          {/* Protected Routes */}
          {isAuthenticated && (
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/manager" element={<ContentManagerPage />} />
              <Route path="/manager/editor/:schemaId/new" element={<ContentItemPage />} />
              <Route path="/manager/editor/:contentId" element={<ContentItemPage />} />
              <Route path="/builder" element={<ContentSchemaBuilderPage />} />
              <Route path="/builder/schemas/:schemaId" element={<SchemaEditorPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />}>
                <Route index element={<Navigate to="account" replace />} />
                <Route path="account" element={<SettingsAccountPage />} />
                <Route path="workspaces" element={<SettingsWorkspacesPage />} />
                <Route path="members" element={<SettingsMembersPage />} />
                <Route path="database" element={<SettingsDatabasePage />} />
                <Route path="billing" element={<SettingsBillingPage />} />
              </Route>
              <Route path="/community" element={<CommunityPage />}>
                <Route index element={<Navigate to="forums" replace />} />
                <Route path="forums" element={<ForumManagementPage />} />
              </Route>
              <Route path="/community/forums/:forumId" element={<ForumDetailPage />} />
              <Route path="/community/forums/:forumId/new-post" element={<NewPostPage />} />
              <Route path="/community/posts/:postId" element={<PostCommentsPage />} />
              <Route path="/community/posts/:postId/:commentId" element={<PostCommentsPage />} />
            </Route>
          )}
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
};

const App: FC = () => (
  <>
    <div id="radix-portal-root" />
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <WorkspaceProvider>
              <AppContent />
            </WorkspaceProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </>
);

export default App;
