# Test Utilities

This directory contains reusable test utilities and helper functions to simplify writing tests.

## Mock Helpers

The `mock-helpers.tsx` file provides comprehensive utilities for mocking API modules, hooks, and test data.

### Quick Start

```typescript
import {
  createMockContentItem,
  createMockSchema,
  createApiResponse,
  updateMockLocation
} from './utils/mock-helpers';
```

### API Response Helpers

#### `createApiResponse<T>(data: T)`
Creates a successful API response structure.

```typescript
const response = createApiResponse([item1, item2]);
// Returns: { data: [item1, item2], error: null }
```

#### `createApiError(message: string, code?: string)`
Creates an error API response structure.

```typescript
const errorResponse = createApiError('Not found', '404');
// Returns: { data: null, error: { message: 'Not found', code: '404' } }
```

### Mock Data Factories

#### `createMockContentItem(overrides?)`
Creates a mock ContentItemRow with sensible defaults.

```typescript
const item = createMockContentItem({
  id: 5,
  title: 'My Test Item',
  schema_id: 2
});
```

#### `createMockContentItems(count, baseOverrides?)`
Creates multiple mock content items.

```typescript
const items = createMockContentItems(10, { schema_id: 2 });
// Creates 10 items with schema_id: 2
```

#### `createMockSchema(overrides?)`
Creates a mock ContentSchemaRow.

```typescript
const schema = createMockSchema({
  id: 1,
  name: 'Blog Post'
});
```

#### `createMockSchemas(count, baseOverrides?)`
Creates multiple mock schemas.

```typescript
const schemas = createMockSchemas(3);
// Creates 3 schemas with auto-incrementing IDs
```

#### `createMockWorkspace(overrides?)`
Creates a mock workspace object.

```typescript
const workspace = createMockWorkspace({
  id: 1,
  name: 'My Workspace'
});
```

### Hook Mock Creators

These functions create mock implementations for React hooks:

- `createMockUseToast()` - Mock toast hook
- `createMockUseWorkspace(options?)` - Mock workspace hook
- `createMockWorkspaceProvider()` - Mock WorkspaceProvider component
- `createMockUseDebounceCallback()` - Mock debounce hook
- `createMockUseLocation(initialLocation?)` - Mock useLocation hook
- `createMockUseNavigate()` - Mock useNavigate hook

### Complete Page Mock Setups

#### `getContentManagerPageMocks(options?)`
Returns all mocks needed for ContentManagerPage tests.

**Note:** Due to Vitest's hoisting requirements, you cannot use this function directly in vi.mock() calls. Instead, use it as a reference for what mocks are needed.

```typescript
// ❌ DON'T DO THIS (causes hoisting errors)
const mocks = getContentManagerPageMocks();
vi.mock('../src/lib/api/ContentApi', () => mocks.contentApi);

// ✅ DO THIS INSTEAD
const mockContentApi = vi.hoisted(() => ({
  listContentItems: vi.fn(),
  deleteContentItem: vi.fn(),
  updateContentItem: vi.fn()
}));

vi.mock('../src/lib/api/ContentApi', () => mockContentApi);

// Then use helpers in beforeEach
beforeEach(() => {
  mockContentApi.listContentItems.mockResolvedValue(
    createApiResponse([
      createMockContentItem({ id: 1 }),
      createMockContentItem({ id: 2 })
    ])
  );
});
```

#### `getSchemaBuilderPageMocks(options?)`
Returns all mocks needed for ContentSchemaBuilderPage tests.

### Utility Functions

#### `updateMockLocation(useLocationMock, location)`
Updates the mock implementation of useLocation (useful for simulating navigation).

```typescript
updateMockLocation(useLocationMock, {
  pathname: '/manager',
  search: '?schema=2&search=test',
  key: 'test'
});
```

#### `updateApiMockResponse<T>(mockFn, data, error?)`
Updates the mock response for an API call.

```typescript
updateApiMockResponse(mockApi.listSchemas, schemas);
// or with an error
updateApiMockResponse(mockApi.listSchemas, null, {
  message: 'Server error',
  code: '500'
});
```

## Example: Setting Up a Test File

Here's a complete example of setting up a test file with proper mocking:

```typescript
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MyComponent from '../src/pages/MyComponent';
import { render } from './utils/test-utils';

// Import helpers AFTER vi.mock calls
import {
  createMockContentItem,
  createMockSchema,
  createApiResponse
} from './utils/mock-helpers';

// 1. Hoist all mocks
const mockContentApi = vi.hoisted(() => ({
  listContentItems: vi.fn(),
  deleteContentItem: vi.fn()
}));

const mockSchemaApi = vi.hoisted(() => ({
  listSchemas: vi.fn()
}));

const mockUseToast = vi.hoisted(() => () => ({ toast: vi.fn() }));

const mockUseWorkspace = vi.hoisted(() => () => ({
  currentWorkspace: { id: 1, name: 'Test Workspace' },
  workspaces: [{ id: 1, name: 'Test Workspace' }],
  isLoading: false
}));

const mockWorkspaceProvider = vi.hoisted(() =>
  ({ children }: { children: React.ReactNode }) => <div>{children}</div>
);

// 2. Setup vi.mock calls
vi.mock('../src/lib/api/ContentApi', () => mockContentApi);
vi.mock('../src/lib/api/SchemaApi', () => mockSchemaApi);
vi.mock('../src/hooks/use-toast', () => ({ useToast: mockUseToast }));
vi.mock('../src/lib/contexts/WorkspaceContext', () => ({
  useWorkspace: mockUseWorkspace,
  WorkspaceProvider: mockWorkspaceProvider
}));

// 3. Write tests
describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock responses using helpers
    mockContentApi.listContentItems.mockResolvedValue(
      createApiResponse([
        createMockContentItem({ id: 1, title: 'Test Item' })
      ])
    );

    mockSchemaApi.listSchemas.mockResolvedValue(
      createApiResponse([
        createMockSchema({ id: 1, name: 'Test Schema' })
      ])
    );
  });

  it('should render items', async () => {
    render(<MyComponent />);

    await waitFor(async () => {
      expect(await screen.findByText('Test Item')).toBeTruthy();
    });
  });
});
```

## Best Practices

1. **Always use `vi.hoisted()`** when creating mocks that will be used in `vi.mock()` calls
2. **Import helpers AFTER** `vi.mock()` calls to avoid hoisting errors
3. **Use factory functions** (`createMock*`) to create test data with sensible defaults
4. **Use `updateMockLocation`** instead of directly calling `mockImplementation` for location changes
5. **Reset mocks** in `beforeEach` with `vi.clearAllMocks()`
6. **Re-setup mock responses** in `beforeEach` since `clearAllMocks` removes them

## Common Issues

### "Cannot access before initialization" Error

This happens when you try to use a variable in `vi.mock()` before it's hoisted:

```typescript
// ❌ Wrong - mocks not hoisted
const mocks = getContentManagerPageMocks();
vi.mock('../src/lib/api/ContentApi', () => mocks.contentApi);

// ✅ Correct - use vi.hoisted
const mockContentApi = vi.hoisted(() => ({
  listContentItems: vi.fn()
}));
vi.mock('../src/lib/api/ContentApi', () => mockContentApi);
```

### Mocks Not Working in Tests

Make sure you're re-setting up mock responses in `beforeEach`:

```typescript
beforeEach(() => {
  vi.clearAllMocks(); // This clears mock implementations

  // Re-setup responses
  mockApi.listItems.mockResolvedValue(createApiResponse([]));
});
```

## Additional Resources

- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Vitest vi.hoisted() docs](https://vitest.dev/api/vi.html#vi-hoisted)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
