import React, { useEffect } from "react";
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
import ContentSchemaBuilderPage from "./pages/ContentSchemaBuilderPage";
import ContentManagerPage from "./pages/ContentManagerPage";
import ContentItemPage from "./pages/ContentItemPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AssetsLibraryPage from "./pages/AssetsLibraryPage";
import SignInPage from "./pages/SignInPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DeveloperPage from "./pages/DeveloperPage";
import DocumentationPage from "./pages/DocumentationPage";
import ContentSearchPage from "./pages/ContentSearchPage";
import CommentsPage from "./pages/CommentsPage";
import { AppLayout } from "./components/Layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { initializeApiStorage } from "@/lib/api";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "./components/ProtectedRoute";

// Load markdown-it for the markdown editor
import "./utils/markdownIt";

const App = () => {
  // Initialize API storage on app start
  useEffect(() => {
    const init = async () => {
      await initializeApiStorage();
    };
    
    init();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <SearchProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public Routes */}
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFound />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Index />} />
                  <Route path="/manager" element={<ContentManagerPage />} />
                  <Route path="/manager/markdown" element={<MarkdownEditorPage />} />
                  <Route path="/manager/json" element={<JsonEditorPage />} />
                  <Route path="/manager/block" element={<BlockEditorPage />} />
                  <Route path="/manager/editor/:schemaId/:contentId" element={<ContentItemPage />} />
                  <Route path="/builder" element={<ContentSchemaBuilderPage />} />
                  <Route path="/builder/:schemaId/new" element={<ContentItemPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/library" element={<AssetsLibraryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/developer/*" element={<DeveloperPage />} />
                  <Route path="/documentation" element={<DocumentationPage />} />
                  <Route path="/search" element={<ContentSearchPage />} />
                  <Route path="/comments" element={<CommentsPage />} />
                </Route>
                
                {/* Redirect older routes */}
                <Route path="/signin" element={<Navigate to="/sign-in" replace />} />
              </Routes>
            </TooltipProvider>
          </SearchProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
