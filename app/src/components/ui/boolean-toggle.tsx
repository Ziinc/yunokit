import { type HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export interface BooleanToggleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: boolean
  onChange: (value: boolean) => void
}

export const BooleanToggle = ({
  value,
  onChange,
  className,
  ...props
}: BooleanToggleProps) => {
  const baseButtonClasses =
    "flex-1 basis-0 px-3 py-1 text-center text-xs font-medium lowercase transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  const inactiveClasses = "text-muted-foreground hover:text-foreground"
  const activeClasses = "bg-cms-purple text-white shadow-sm"

  return (
    <div
      role="group"
      className={cn(
        "inline-flex min-w-[160px] items-center overflow-hidden rounded-full border border-border bg-background p-1 shadow-sm",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-pressed={value}
        onClick={() => onChange(true)}
        className={cn(
          baseButtonClasses,
          "rounded-l-full",
          value ? activeClasses : inactiveClasses,
        )}
      >
        true
      </button>
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => onChange(false)}
        className={cn(
          baseButtonClasses,
          "rounded-r-full",
          value ? inactiveClasses : activeClasses,
        )}
      >
        false
      </button>
    </div>
  )
}
