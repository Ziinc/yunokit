
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { ContentStatusBadge } from "@/components/Content/ContentList/ContentStatusBadge";

export const CommentsSystem: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments and Review System</CardTitle>
        <CardDescription>
          Using comments for collaboration and content review
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Understanding Comments</h3>
          <p>
            The comments system in SupaContent facilitates collaboration between content creators, editors, and reviewers. 
            Comments can be general or specific to certain content fields, allowing for targeted feedback.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Comment Types</h4>
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">General</Badge>
                    <span className="font-medium">Overall feedback</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Comments about the entire content item
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Field-Specific</Badge>
                    <span className="font-medium">Targeted feedback</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Comments tied to a particular field
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Resolution Status</Badge>
                    <span className="font-medium">Tracking fixes</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    Comments can be marked as resolved or unresolved
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Be specific:</strong> Clearly identify what needs to be changed
                </li>
                <li>
                  <strong>Be constructive:</strong> Offer solutions, not just problems
                </li>
                <li>
                  <strong>Use field-specific:</strong> Target comments to exact locations
                </li>
                <li>
                  <strong>Mark as resolved:</strong> Clear comments once addressed
                </li>
                <li>
                  <strong>Batch comments:</strong> Group similar issues in one comment
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Example Review Process</h3>
          
          <div className="rounded-md border p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Step 1: Content Submission</h4>
              <p className="text-sm text-muted-foreground">
                Content creator changes the status from <ContentStatusBadge status="draft" /> to <ContentStatusBadge status="pending_review" />
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Step 2: Reviewer Comments</h4>
              <div className="rounded-md border p-3 bg-muted/50">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Alex</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                      <Badge variant="outline" className="text-xs">content field</Badge>
                    </div>
                    <p className="text-sm mt-1">
                      The design principles section needs more examples. Consider adding practical illustrations of each principle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Step 3: Content Revisions</h4>
              <p className="text-sm text-muted-foreground">
                Content creator makes requested changes and responds to comments
              </p>
              <div className="rounded-md border p-3 bg-muted/50 ml-8 mt-2">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Sarah</span>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                    <p className="text-sm mt-1">
                      Added examples for consistency, feedback, and simplicity principles. Please review the updated section.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800 text-xs">Resolved</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Step 4: Final Approval</h4>
              <p className="text-sm text-muted-foreground">
                Reviewer approves changes and content status changes to <ContentStatusBadge status="published" />
              </p>
            </div>
          </div>
          
          <Alert>
            <AlertDescription>
              <strong>Pro Tip:</strong> Set up notifications for your team to stay informed when comments are added or resolved.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};
