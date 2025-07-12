import { vi } from 'vitest';

export const SearchContext = {
  searchQuery: '',
  setSearchQuery: vi.fn(),
  searchResults: [],
  isLoading: false,
  performSearch: vi.fn().mockResolvedValue([]),
}; 