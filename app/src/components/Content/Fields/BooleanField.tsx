import { BooleanToggle } from "@/components/ui/boolean-toggle"
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
      <BooleanToggle id={id} value={value} onChange={onChange} />
    </BaseField>
  )
}
