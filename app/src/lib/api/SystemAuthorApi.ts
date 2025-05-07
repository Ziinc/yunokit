import { mockSystemAuthors } from "../mocks";

// In-memory storage
let authors: SystemAuthor[] = [...mockSystemAuthors];

// Helper to simulate network delay for a more realistic experience
const simulateNetworkDelay = async (minMs: number = 300, maxMs: number = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export interface SystemAuthor {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * SystemAuthorApi - Provides methods for managing system authors
 */
export class SystemAuthorApi {
  // Initialize storage with example system authors if empty
  static async initializeStorage(): Promise<void> {
    if (authors.length === 0) {
      authors = [...mockSystemAuthors];
      console.log("Initialized system authors storage with mock data");
    }
  }

  // Get all system authors
  static async getSystemAuthors(): Promise<SystemAuthor[]> {
    return authors;
  }

  // Get a system author by ID
  static async getSystemAuthorById(id: string): Promise<SystemAuthor | null> {
    return authors.find(author => author.id === id) || null;
  }

  // Save a system author (create or update)
  static async saveSystemAuthor(author: Partial<SystemAuthor>): Promise<SystemAuthor> {
    await simulateNetworkDelay();
    const now = new Date().toISOString();
    
    if (author.id) {
      // Update existing author
      const existingIndex = authors.findIndex(a => a.id === author.id);
      if (existingIndex >= 0) {
        authors[existingIndex] = {
          ...authors[existingIndex],
          ...author,
          updatedAt: now
        };
      }
    } else {
      // Create new author
      const newAuthor: SystemAuthor = {
        id: crypto.randomUUID(),
        name: author.name!,
        description: author.description,
        createdAt: now,
        updatedAt: now
      };
      authors.push(newAuthor);
    }
    
    return author.id ? 
      authors.find(a => a.id === author.id)! : 
      authors[authors.length - 1];
  }

  // Save multiple system authors
  static async saveSystemAuthors(newAuthors: SystemAuthor[]): Promise<SystemAuthor[]> {
    await simulateNetworkDelay();
    authors = newAuthors;
    return authors;
  }

  // Delete a system author
  static async deleteSystemAuthor(id: string): Promise<void> {
    await simulateNetworkDelay();
    authors = authors.filter(author => author.id !== id);
  }
} 