
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EnumFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  description?: string;
}

export const EnumField = ({
  id,
  name,
  value,
  onChange,
  options,
  description,
}: EnumFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="font-medium">{name}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-col space-y-1 mt-2"
      >
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`${id}-${option}`} />
            <Label htmlFor={`${id}-${option}`} className="font-normal">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default EnumField;
