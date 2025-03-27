
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Code, FileText, ArrowRight, List, Lightbulb } from "lucide-react";

export const BestPractices: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>Best Practices</span>
        </CardTitle>
        <CardDescription>
          Recommendations for getting the most out of FunCMS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Content Modeling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Content Modeling</span>
            </h3>
            
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Start with user needs</p>
                  <p className="text-sm text-muted-foreground">
                    Design content types based on how the content will be used, not just how it will be stored.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Balance flexibility and structure</p>
                  <p className="text-sm text-muted-foreground">
                    Too rigid and content creators feel constrained; too flexible and content becomes inconsistent.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Use clear field names and descriptions</p>
                  <p className="text-sm text-muted-foreground">
                    Help content creators understand exactly what each field is for with descriptive labels and guidance.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Build relationships between content</p>
                  <p className="text-sm text-muted-foreground">
                    Use relation fields to connect related content instead of duplicating information.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Content Operations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <List className="h-5 w-5 text-purple-500" />
              <span>Content Operations</span>
            </h3>
            
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Establish a clear workflow</p>
                  <p className="text-sm text-muted-foreground">
                    Define who creates, reviews, and publishes content, with clear responsibilities at each stage.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Use drafts effectively</p>
                  <p className="text-sm text-muted-foreground">
                    Create drafts for work-in-progress content and only submit for review when ready.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Provide specific feedback</p>
                  <p className="text-sm text-muted-foreground">
                    Use field-specific comments to pinpoint exactly what needs to be changed.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Schedule content strategically</p>
                  <p className="text-sm text-muted-foreground">
                    Use the datetime fields to schedule content publication for optimal timing.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Technical Setup */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Code className="h-5 w-5 text-orange-500" />
              <span>Technical Setup</span>
            </h3>
            
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Plan migrations carefully</p>
                  <p className="text-sm text-muted-foreground">
                    Test schema changes in development before applying to production, and always have a rollback plan.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Cache API responses</p>
                  <p className="text-sm text-muted-foreground">
                    Implement appropriate caching strategies to improve performance and reduce database load.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Optimize asset delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Use responsive images and appropriate formats to ensure fast loading times.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Set up proper backups</p>
                  <p className="text-sm text-muted-foreground">
                    Configure regular database backups to prevent content loss.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Performance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-green-500" />
              <span>Performance & Security</span>
            </h3>
            
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Implement proper access controls</p>
                  <p className="text-sm text-muted-foreground">
                    Set up roles and permissions to ensure users can only access what they need.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Monitor API usage</p>
                  <p className="text-sm text-muted-foreground">
                    Track API calls and optimize queries that are slow or frequently used.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Validate user inputs</p>
                  <p className="text-sm text-muted-foreground">
                    Implement proper validation for all user inputs to prevent security issues.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Implement rate limiting</p>
                  <p className="text-sm text-muted-foreground">
                    Protect your API from abuse by implementing proper rate limiting.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
