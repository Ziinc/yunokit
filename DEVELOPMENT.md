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
