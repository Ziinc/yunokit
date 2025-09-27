import { vi } from 'vitest';

// Default mock implementation for useSWR
const mockUseSWR = vi.fn().mockImplementation((key: string) => {
  // Default connected state with healthy projects
  if (key === "sbConnection") {
    return {
      data: { result: true },
      mutate: vi.fn(),
      isLoading: false,
    };
  }
  
  if (key === "valid_access_token") {
    return {
      data: false, // token is not expired
      mutate: vi.fn(),
      isLoading: false,
    };
  }
  
  if (key === "projects") {
    return {
      data: [
        {
          id: "project-1",
          name: "Test Project 1",
          status: "ACTIVE_HEALTHY",
          region: "us-east-1",
        },
        {
          id: "project-2", 
          name: "Test Project 2",
          status: "ACTIVE_HEALTHY",
          region: "us-west-2",
        },
      ],
      mutate: vi.fn(),
      isLoading: false,
    };
  }
  
  // Default fallback
  return { 
    data: null, 
    mutate: vi.fn(), 
    isLoading: false 
  };
});

export default mockUseSWR; 