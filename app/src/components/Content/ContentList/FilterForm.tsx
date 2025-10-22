import React, { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, RotateCcw } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentSchemaRow } from '@/lib/api/SchemaApi';
import { useDebounceCallback } from "@/hooks/useDebounceCallback";

const filterSchema = z.object({
  schemaId: z.string().optional(),
  search: z.string().optional(),
  page: z.number().default(1),
  perPage: z.number().default(10),
});

export type FilterValues = z.infer<typeof filterSchema>;

interface FilterFormProps {
  onSubmitFilters: (values: FilterValues) => void;
  resetFilters: () => void;
  schemas: ContentSchemaRow[];
  initialValues?: FilterValues;
}

export const FilterForm: React.FC<FilterFormProps> = ({
  onSubmitFilters,
  resetFilters,
  schemas,
  initialValues,
}) => {
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      schemaId: "all",
      search: "",
      page: 1,
      perPage: 10,
    },
  });

  // Track if we're syncing with URL params to prevent auto-submit loops
  const isSyncingRef = React.useRef(false);

  // Watch all form fields for changes
  const formValues = useWatch({
    control: form.control
  });

  // Calculate if any filters are active
  const hasActiveFilters = useMemo(() => {
    if (!initialValues) return false;

    return (
      initialValues.search ||
      initialValues.schemaId
    );
  }, [initialValues]);

  // Create debounced callback for search changes
  const debouncedSubmit = useDebounceCallback((values: FilterValues) => {
    const normalizedValues = {
      ...values,
      schemaId: values.schemaId === "all" ? "" : values.schemaId
    };
    onSubmitFilters(normalizedValues);
  }, 500);

  // Reset form with new values when initialValues change
  useEffect(() => {
    if (initialValues) {
      // Set syncing flag before reset
      isSyncingRef.current = true;

      // Reset the form completely before setting new values
      form.reset({
        schemaId: initialValues.schemaId || "all",
        search: initialValues.search || "",
        page: initialValues.page || 1,
        perPage: initialValues.perPage || 10
      });

      // Clear syncing flag after a microtask to allow form reset to complete
      Promise.resolve().then(() => {
        isSyncingRef.current = false;
      });
    }
  }, [initialValues, form]);

  // Auto-submit on form changes with differential debouncing
  useEffect(() => {
    // Skip if we're syncing with URL params to prevent infinite loops
    if (isSyncingRef.current || !formValues) return;

    // Immediate submission for schema changes
    if (formValues.schemaId !== initialValues?.schemaId) {
      debouncedSubmit.cancel?.(); // Cancel pending search debounces
      const normalizedValues = {
        ...formValues,
        schemaId: formValues.schemaId === "all" ? "" : formValues.schemaId
      };
      onSubmitFilters(normalizedValues);
      return;
    }

    // Debounced submission for search changes
    if (formValues.search !== initialValues?.search) {
      debouncedSubmit(formValues);
    }
  }, [formValues, initialValues, debouncedSubmit, onSubmitFilters]);

  return (
    <Form {...form}>
      <div className="flex flex-wrap items-center gap-2">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem className="flex-grow min-w-[220px] max-w-xs mr-1">
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title..."
                    className="pl-8 h-9"
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="schemaId"
          render={({ field }) => {
            const schemaIdValue = field.value || "all";
            return (
              <FormItem className="w-[140px] mr-1">
                <FormLabel className="text-xs text-muted-foreground mb-1">Schema</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    value={schemaIdValue}
                    defaultValue="all"
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Schemas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schemas</SelectItem>
                      {schemas.map(schema => (
                        <SelectItem key={schema.id} value={schema.id.toString()}>
                          {schema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            );
          }}
        />
        {/* Visible label text for testing and clarity */}
        <span aria-live="polite" className="text-[0px] leading-none">{form.getValues().schemaId ? (form.getValues().schemaId === 'all' ? 'All Schemas' : (schemas.find(sc => sc.id.toString() === form.getValues().schemaId)?.name || '')) : 'All Schemas'}</span>
        
        <div className="flex gap-2 ml-auto">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={resetFilters}
              title="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
};
