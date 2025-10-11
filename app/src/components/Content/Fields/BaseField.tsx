import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FieldPropsBase {
  id: string
  name: string
  description?: string
}

interface BaseFieldProps extends FieldPropsBase {
  children: ReactNode
  inline?: boolean
  descriptionPosition?: "above" | "below"
  className?: string
}

export const BaseField = ({
  id,
  name,
  description,
  inline = false,
  descriptionPosition = "below",
  className,
  children,
}: BaseFieldProps) => {
  if (inline) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="font-medium">
            {name}
          </Label>
          {children}
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="font-medium">
        {name}
      </Label>
      {description && descriptionPosition === "above" ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children}
      {description && descriptionPosition === "below" ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

