
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Code, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const WelcomeSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to FunCMS</CardTitle>
        <CardDescription>
          Get started with our headless content management system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          FunCMS is a modern headless content management system designed to make content management easy and developer-friendly.
          With a flexible content schema system, powerful editors, and comprehensive API, FunCMS helps you build and manage digital content efficiently.
        </p>
        
        <Alert>
          <AlertDescription>
            New to FunCMS? Start with our quickstart templates to set up common content structures for your project.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Content Schemas</span>
              </CardTitle>
              <CardDescription>
                Learn how to define custom content models
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link to="/schemas">
                <Button variant="ghost" className="w-full justify-between">
                  <span>Explore Schemas</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5" />
                <span>Developer API</span>
              </CardTitle>
              <CardDescription>
                Integration guides for developers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link to="/api-examples">
                <Button variant="ghost" className="w-full justify-between">
                  <span>API Documentation</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Content Editors</span>
              </CardTitle>
              <CardDescription>
                Discover our powerful content editing tools
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link to="/markdown">
                <Button variant="ghost" className="w-full justify-between">
                  <span>Editor Overview</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
