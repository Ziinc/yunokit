import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { BaseField, type FieldPropsBase } from "./BaseField"

interface PasswordFieldProps extends FieldPropsBase {
  value: string
  onChange: (value: string) => void
}

export const PasswordField = ({
  id,
  name,
  value,
  onChange,
  description,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <BaseField id={id} name={name} description={description}>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full aspect-square"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </BaseField>
  )
}
