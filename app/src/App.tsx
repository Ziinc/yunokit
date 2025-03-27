
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MarkdownEditorPage from "./pages/MarkdownEditorPage";
import JsonEditorPage from "./pages/JsonEditorPage";
import BlockEditorPage from "./pages/BlockEditorPage";
import ContentSchemasPage from "./pages/ContentSchemasPage";
import ContentEditorPage from "./pages/ContentEditorPage";
import ContentItemPage from "./pages/ContentItemPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AssetsLibraryPage from "./pages/AssetsLibraryPage";
import SignInPage from "./pages/SignInPage";
import ApiExamplesPage from "./pages/ApiExamplesPage";
import DocumentationPage from "./pages/DocumentationPage";
import DatabaseMigrationPage from "./pages/DatabaseMigrationPage";
import ContentSearchPage from "./pages/ContentSearchPage";
import CommentsPage from "./pages/CommentsPage";
import { AppLayout } from "./components/Layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";

// Load markdown-it for the markdown editor
import "./utils/markdownIt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/editor/markdown" element={<MarkdownEditorPage />} />
              <Route path="/editor/json" element={<JsonEditorPage />} />
              <Route path="/editor/block" element={<BlockEditorPage />} />
              <Route path="/schemas" element={<ContentSchemasPage />} />
              <Route path="/content" element={<ContentEditorPage />} />
              <Route path="/content/:schemaId/new" element={<ContentItemPage />} />
              <Route path="/content/:schemaId/:contentId" element={<ContentItemPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/assets" element={<AssetsLibraryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/developer/api" element={<ApiExamplesPage />} />
              <Route path="/developer/migrations" element={<DatabaseMigrationPage />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route path="/search" element={<ContentSearchPage />} />
              <Route path="/comments" element={<CommentsPage />} />
            </Route>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/callback" element={<Navigate to="/profile" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
