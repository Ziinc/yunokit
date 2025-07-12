
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiselectFieldProps {
  id: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  description?: string;
}

export const MultiselectField: React.FC<MultiselectFieldProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  description,
}) => {
  const handleCheckboxChange = (checked: boolean | "indeterminate", option: string) => {
    if (checked === "indeterminate") return;
    
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter(item => item !== option));
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-medium">{name}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="flex flex-col space-y-2 mt-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${id}-${option}`}
              checked={value.includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(checked, option)}
            />
            <Label htmlFor={`${id}-${option}`} className="font-normal">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
