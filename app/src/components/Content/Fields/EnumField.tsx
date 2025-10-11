import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BaseField, type FieldPropsBase } from "./BaseField"

interface EnumFieldProps extends FieldPropsBase {
  value: string
  onChange: (value: string) => void
  options: string[]
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
    <BaseField
      id={id}
      name={name}
      description={description}
      descriptionPosition="above"
    >
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
    </BaseField>
  )
}
