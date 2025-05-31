import React, { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Filter } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { ContentSchema } from "@/lib/contentSchema";

const filterSchema = z.object({
  status: z.string().optional(),
  schemaId: z.string().optional(),
  author: z.string().optional(),
  search: z.string().optional(),
  page: z.number().default(1),
  perPage: z.number().default(10),
});

export type FilterValues = z.infer<typeof filterSchema>;

interface FilterFormProps {
  onSubmitFilters: (values: FilterValues) => void;
  resetFilters: () => void;
  schemas: ContentSchema[];
  uniqueAuthors: string[];
  initialValues?: FilterValues;
}

export const FilterForm: React.FC<FilterFormProps> = ({
  onSubmitFilters,
  resetFilters,
  schemas,
  uniqueAuthors,
  initialValues,
}) => {
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "all",
      schemaId: "all",
      author: "all",
      search: "",
      page: 1,
      perPage: 10,
    },
  });

  // Watch all form fields for changes
  const formValues = useWatch({
    control: form.control
  });

  // Check if current form values are different from initial/active filters
  const hasChanges = useMemo(() => {
    // Convert empty strings to "all" for comparison
    const normalizeValue = (value: string | undefined) => value || "all";
    
    // Get the current active filters
    const activeStatus = normalizeValue(initialValues?.status);
    const activeSchemaId = normalizeValue(initialValues?.schemaId);
    const activeAuthor = normalizeValue(initialValues?.author);
    const activeSearch = initialValues?.search || "";

    // Compare current values with active filters
    return (
      formValues.search !== activeSearch ||
      normalizeValue(formValues.status) !== activeStatus ||
      normalizeValue(formValues.schemaId) !== activeSchemaId ||
      normalizeValue(formValues.author) !== activeAuthor
    );
  }, [formValues, initialValues]);

  // Calculate if any filters are active
  const hasActiveFilters = useMemo(() => {
    if (!initialValues) return false;
    
    return (
      initialValues.search || 
      initialValues.status || 
      initialValues.schemaId || 
      initialValues.author
    );
  }, [initialValues]);

  // Reset form with new values when initialValues change
  useEffect(() => {
    if (initialValues) {
      // Reset the form completely before setting new values
      form.reset({
        status: initialValues.status || "all",
        schemaId: initialValues.schemaId || "all",
        author: initialValues.author || "all",
        search: initialValues.search || "",
        page: initialValues.page || 1,
        perPage: initialValues.perPage || 10
      });
    }
  }, [initialValues, form]);

  const handleSubmit = (values: FilterValues) => {
    // Check if all values are in default state
    const isDefaultState = 
      !values.search && 
      values.status === "all" && 
      values.schemaId === "all" && 
      values.author === "all";

    if (isDefaultState) {
      resetFilters();
      return;
    }

    const normalizedValues = {
      ...values,
      status: values.status === "all" ? "" : values.status,
      author: values.author === "all" ? "" : values.author,
      schemaId: values.schemaId === "all" ? "" : values.schemaId
    };
    onSubmitFilters(normalizedValues);
  };

  return (
    <Form {...form} key={`form-${initialValues?.status || 'all'}-${initialValues?.schemaId || 'all'}`}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="flex flex-wrap items-center gap-2"
      >
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
                <Select 
                  onValueChange={field.onChange} 
                  value={schemaIdValue}
                  defaultValue="all"
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Content Schema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schemas</SelectItem>
                    {schemas.map(schema => (
                      <SelectItem key={schema.id} value={schema.id}>
                        {schema.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            );
          }}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => {
            const statusValue = field.value || "all";
            return (
              <FormItem className="w-[140px] mr-1">
                <Select 
                  onValueChange={field.onChange}
                  value={statusValue}
                  defaultValue="all"
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            );
          }}
        />
        
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => {
            const authorValue = field.value || "all";
            return (
              <FormItem className="w-[140px] mr-1">
                <Select 
                  onValueChange={field.onChange} 
                  value={authorValue}
                  defaultValue="all"
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {uniqueAuthors.map(author => (
                      <SelectItem key={author} value={author}>
                        {author.split('@')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            );
          }}
        />
        
        <div className="flex gap-2 ml-auto">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={resetFilters}
            >
              Clear
            </Button>
          )}
          <Button 
            type="submit" 
            size="sm" 
            className="h-9" 
            disabled={!hasChanges}
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply
          </Button>
        </div>
      </form>
    </Form>
  );
};
