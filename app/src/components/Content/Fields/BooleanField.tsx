import { Switch } from "@/components/ui/switch"
import { BaseField, type FieldPropsBase } from "./BaseField"

interface BooleanFieldProps extends FieldPropsBase {
  value: boolean
  onChange: (value: boolean) => void
}

export const BooleanField = ({
  id,
  name,
  value,
  onChange,
  description,
}: BooleanFieldProps) => {
  return (
    <BaseField id={id} name={name} description={description} inline>
      <Switch
        id={id}
        checked={value}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-cms-purple"
      />
    </BaseField>
  )
}
