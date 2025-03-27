
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface UuidFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  generateOnCreate?: boolean;
}

export const UuidField: React.FC<UuidFieldProps> = ({
  id,
  name,
  value,
  onChange,
  description,
  generateOnCreate,
}) => {
  const generateUuid = () => {
    const uuid = crypto.randomUUID();
    onChange(uuid);
  };
  
  // Generate UUID on first render if needed
  React.useEffect(() => {
    if (generateOnCreate && !value) {
      generateUuid();
    }
  }, []);
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{name}</Label>
      <div className="flex space-x-2">
        <Input
          id={id}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="UUID will be generated"
          readOnly={generateOnCreate}
          className={generateOnCreate ? "bg-muted" : ""}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={generateUuid}
          title="Generate new UUID"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};
