import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AuthorsSectionProps {
  teamMembers: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

export const AuthorsSection: React.FC<AuthorsSectionProps> = ({
  teamMembers,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Content Authors</CardTitle>
        <CardDescription>
          Team members available for content publishing
        </CardDescription>
      </CardHeader>
              <CardContent className="space-content-lg">
        {/* Team Members */}
        <div>
          <h3 className="text-lg font-medium mb-4">Team Member Authors</h3>

          <div className="space-content">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="padding-card-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
