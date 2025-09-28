
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BooleanFieldProps {
  id: string;
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

export const BooleanField = ({
  id,
  name,
  value,
  onChange,
  description,
}: BooleanFieldProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="font-medium">
          {name}
        </Label>
        <Switch
          id={id}
          checked={value}
          onCheckedChange={onChange}
          className="data-[state=checked]:bg-cms-purple"
        />
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default BooleanField;
