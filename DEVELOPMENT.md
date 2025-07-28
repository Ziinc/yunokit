# Development Guide

## Repository Structure

- app: webapp for Yunokit
- design: design assets
- shared: shared logic and assets between webapp and docapp
- web: documentation and static content app
- supabase: db schema, migrations
  - supabase/schemas/app.sql: schema for app db
  - supabase/schemas/yuno\*.sql: schema for respective Yunokit module

- All developer documentation should be written in /web

## Commands

```bash
make start
make stop
make restart
make types
make deploy
# generate a migration
make diff f=my_migration
```

## Database Types & Data Transformations

### Database vs Frontend Types

**Use database types directly when possible to avoid unnecessary transformations.**

```typescript
// Good: Use ContentItemRow directly from API
import { type ContentItemRow } from '@/lib/api/ContentApi';
const [items, setItems] = useState<ContentItemRow[]>([]);

// Avoid: Unnecessary transformation layer
const transformContentItem = (item: ContentItemRow): ContentItem => ({ ... });
```

**Key differences between database and frontend types:**

- Database: `snake_case` fields (`schema_id`, `created_at`, `updated_at`)
- Frontend: `camelCase` fields (`schemaId`, `createdAt`, `updatedAt`)
- Database: Numeric IDs (`id: number`, `schema_id: number`)
- Frontend: String IDs (`id: string`, `schemaId: string`)

### When to Transform Data

**Transform only when the component explicitly requires the frontend format:**

```typescript
// Transform when component expects ContentItem
const contentItem: ContentItem = {
  id: dbItem.id?.toString() || '',
  schemaId: dbItem.schema_id?.toString() || '',
  title: dbItem.title || 'Untitled',
  status: (dbItem.status as ContentItemStatus) || 'draft',
  createdAt: dbItem.created_at || '',
  updatedAt: dbItem.updated_at || dbItem.created_at || '',
  publishedAt: dbItem.published_at || undefined,
  data: (dbItem.data as Record<string, unknown>) || {},
};
```

### Views vs Tables

- Views use the `_vw` suffix (e.g., `content_items_vw`)
- Views provide computed fields like `status`
- Use views for read operations, tables for write operations
- Always import the correct type: `ContentItemRow` from views, `ContentItemInsert`/`ContentItemUpdate` for mutations

## Data Mutations with useSWR

### Core Pattern: Optimistic Updates

**All data mutations must use useSWR's `mutate` function for consistency and cache management.**

```typescript
const { data, mutate } = useSWR(key, fetcher);

const handleMutation = async () => {
  try {
    // 1. Optimistic update
    mutate(optimisticData, false);

    // 2. Close UI immediately
    setShowDialog(false);

    // 3. API call
    const response = await apiCall();

    // 4. Handle errors
    if (response.error) {
      mutate(); // Revert
      //log the technical error to console for debugging
      console.error("Error performing action: ", response.error);
      //   show appropriate error toast, don't show user the backend technical error
      showErrorToast("Could not perform action");
      return;
    }

    // 5. Update with real data, don't revalidate the data
    mutate(response.data, { revalidate: false });
    showSuccessToast();
  } catch (error) {
    mutate(); // Revert on exception
    showErrorToast("Unexpected error");
  }
};
```

**Benefits:** Instant UI feedback, automatic error recovery, cache consistency.

### Error Handling for Supabase Functions

**Always check `response.error` before proceeding:**

```typescript
const response = await supabase.functions.invoke("endpoint");

if (response.error) {
  toast({
    title: "Operation failed",
    description: response.error.message,
    variant: "destructive",
  });
  return;
}

// Handle success
if (response.data) {
  mutate(response.data);
}
```

**Supabase functions return:** `{ data: T | null, error: { message: string } | null }`

### Schema Editor Operations

**All field operations follow the same pattern:**

```typescript
const { data: schema, mutate: mutateSchema } = useSWR(schemaKey, fetcher);

// Add/Delete/Reorder fields
const updateField = async (updatedSchema) => {
  mutateSchema({ ...schemaResponse, data: updatedSchema }, false);

  const response = await updateSchema(schemaId, updatedSchema, workspaceId);
  if (response.error) {
    mutateSchema(); // Revert
    showError(response.error.message);
    return;
  }
};
```

**Key points:** Use temporary IDs for new fields, filter arrays for deletions, apply drag-drop results for reordering.

### Best Practices

1. **Always use useSWR's `mutate`** for data updates
2. **Check `response.error`** before success logic
3. **Call `mutate()` without arguments** to revert and fetch fresh data
4. **Close dialogs immediately** after optimistic updates
5. **Handle both API errors and exceptions** with proper fallbacks
6. **Use database types directly** to avoid transformation overhead
7. **Transform data only when components require specific formats**

### Anti-Patterns

❌ **Don't update state directly:**

```typescript
// Bad: Bypasses SWR cache
setState(newData);
```

✅ **Do use mutate:**

```typescript
// Good: Updates SWR cache
mutate(newData);
```

❌ **Don't ignore errors:**

```typescript
// Bad: Silent failures
const response = await apiCall();
if (response.data) {
  /* handle success */
}
```

✅ **Do check errors first:**

```typescript
// Good: Proper error handling
if (response.error) {
  /* handle error */ return;
}
```

❌ **Don't transform unnecessarily:**

```typescript
// Bad: Unnecessary transformation
const items = dbItems.map(transformItem);
setItems(items);
```

✅ **Do use database types directly:**

```typescript
// Good: Use database types
setItems(dbItems);
```

## Database

- Views use the `_vw` suffix for db tables.


## Testing of App

- Tests should always be written under the `app/tests` directory. 
- When working on files under `app/src/lib/**`, always ensure that there are appropriate tests written.

- Tests should always be written under the `app/tests` directory. 
- Use the global setup file to perform common app-level setup.

### mocks
- always use automocks in __mocks__ folder
- never use `vi.mock()`

## Coding Style & Architecture

- API modules wrap `supabase.functions.invoke` calls
- Pages consume these helpers and update data through `useSWR`
- Keep domain types in `/types` and share across modules
- Remove prototype code and mock data from production files
