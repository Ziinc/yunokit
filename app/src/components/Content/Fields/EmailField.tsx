
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  id,
  name,
  value,
  onChange,
  description,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{name}</Label>
      <Input
        id={id}
        type="email"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="email@example.com"
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};
