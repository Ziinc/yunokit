import React from 'react';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';
import { cn } from "@/lib/utils";

export type MultiSelectProps = Omit<ReactSelectProps, 'classNames' | 'styles'> & {
  className?: string;
};

const MultiSelect = React.forwardRef<any, MultiSelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <ReactSelect
        ref={ref}
        isClearable={false}
        {...props}
        styles={{
          input: (base) => ({
            ...base,
            'input:focus': {
              boxShadow: 'none',
            },
          }),
          control: (base) => ({
            ...base,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'var(--border)',
            },
          }),
        }}
        classNames={{
          control: (state) => cn(
            "flex min-h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            state.isFocused ? "border-ring" : "",
            className
          ),
          valueContainer: () => "flex flex-wrap gap-1.5 py-1",
          placeholder: () => "text-muted-foreground",
          input: () => "text-sm",
          option: (state) => cn(
            "relative flex cursor-default select-none items-center rounded-full py-1.5 pl-8 pr-3 text-sm outline-none transition-colors",
            state.isFocused && "bg-accent hover:bg-accent",
            state.isSelected && "bg-secondary text-secondary-foreground font-medium"
          ),
          menu: () => "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 mt-1",
          menuList: () => "p-1 max-h-[300px] overflow-auto",
          multiValue: () => "bg-secondary text-secondary-foreground rounded-full mr-1 items-center inline-flex",
          multiValueLabel: () => "text-sm px-2 py-0.5 pl-2.5 max-w-[180px] truncate",
          multiValueRemove: () => "ml-1 hover:text-destructive cursor-pointer p-1.5 rounded-full hover:bg-accent mr-0.5",
          dropdownIndicator: () => "cursor-pointer p-1 rounded-sm hover:bg-accent text-muted-foreground hover:text-foreground",
          indicatorSeparator: () => "hidden"
        }}
      />
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect }; 