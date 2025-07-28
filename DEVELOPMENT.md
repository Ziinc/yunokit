# Development Guide

## Repository Structure

- **app/**: React web application (Vite + TypeScript + SWR)
- **web/**: Docusaurus documentation site  
- **shared/**: Shared UI components with Storybook
- **supabase/**: Database schemas, migrations, Edge Functions
- **comp/strapi/**: Strapi CMS (legacy)

## Architecture

### Frontend Stack
- React 19 + TypeScript + Vite + TailwindCSS
- Radix UI (consolidated package) + SWR + React Router
- Vitest + Playwright for testing

### Backend Stack  
- Supabase (auth, database, edge functions)
- PostgreSQL schemas: `public` (app), `yunocontent` (CMS), `yunocommunity` (forums)
- API modules in `app/src/lib/api/` wrap `supabase.functions.invoke()` calls

## Commands

### Development
```bash
make start           # Start Supabase + React app
make stop            # Stop all services
make restart         # Restart all services
make db.reset        # Reset local database

# App commands (from app/ directory)
npm run dev          # Development server
npm run build        # Production build
npm run lint         # oxlint + eslint
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright e2e tests

# Documentation (from web/ directory)
npm run start        # Docusaurus dev server
npm run build        # Build docs
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

## Data Mutations with SWR

**All data mutations must use SWR's optimistic update pattern:**

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
      console.error("Error:", response.error);
      showErrorToast("Could not perform action");
      return;
    }
    
    // 5. Update with real data
    mutate(response.data, { revalidate: false });
    showSuccessToast();
  } catch (error) {
    mutate(); // Revert on exception
    showErrorToast("Unexpected error");
  }
};
```

### Error Handling for Supabase Functions
Always check `response.error` before proceeding. Supabase functions return `{ data: T | null, error: { message: string } | null }`.

```typescript
const response = await supabase.functions.invoke("endpoint");
if (response.error) {
  toast({ title: "Operation failed", description: response.error.message, variant: "destructive" });
  return;
}
// Handle success with response.data
```

### Best Practices
1. Always use useSWR's `mutate` for data updates
2. Check `response.error` before success logic
3. Call `mutate()` without arguments to revert and fetch fresh data
4. Close dialogs immediately after optimistic updates
5. Handle both API errors and exceptions

1. **Always use useSWR's `mutate`** for data updates
2. **Check `response.error`** before success logic
3. **Call `mutate()` without arguments** to revert and fetch fresh data
4. **Close dialogs immediately** after optimistic updates
5. **Handle both API errors and exceptions** with proper fallbacks
6. **Use database types directly** to avoid transformation overhead
7. **Transform data only when components require specific formats**

- Tests in `app/tests/` directory
- Use automocks in `__mocks__/` folders, never `vi.mock()`
- Use `screen.findBy*` for assertions, avoid `.toHaveAttribute()`
- Never import `@testing-library/jest-dom`

## UI Components & Code Style

- Use consolidated `radix-ui` package: `import { Dialog, Button } from "radix-ui"`
- For Slot usage: `Slot.Slot` from radix-ui package  
- Components in `app/src/components/ui/` follow shadcn/ui patterns
- Pages with tabs must use nested routes for each tab
- Remove unused imports always
- Use `useEffect` callbacks created outside the effect
- Never use `npm install` suggestions, only recommend packages

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

- Reference `app/database.types.ts` for current schema
- Views use `_vw` suffix
- Migration files organized by schema in `supabase/migrations/`
- Keep domain types in `/types` and share across modules