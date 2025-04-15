import { mockSystemAuthors } from "../mocks";

// Storage key
const SYSTEM_AUTHORS_STORAGE_KEY = 'supacontent-system-authors';

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
 * Currently uses localStorage for persistence, but can be extended to use real APIs
 */
export class SystemAuthorApi {
  // Initialize storage with example system authors if empty
  static async initializeStorage(): Promise<void> {
    const storedAuthors = localStorage.getItem(SYSTEM_AUTHORS_STORAGE_KEY);
    if (!storedAuthors) {
      console.log("No stored system authors found, initializing with mock data");
      await this.saveSystemAuthors(mockSystemAuthors);
      console.log("Initialized system authors storage with mock data");
    } else {
      console.log("System authors already exist in storage");
    }
  }

  // Get all system authors
  static async getSystemAuthors(): Promise<SystemAuthor[]> {
    const storedAuthors = localStorage.getItem(SYSTEM_AUTHORS_STORAGE_KEY);
    if (!storedAuthors) return [];
    return JSON.parse(storedAuthors);
  }

  // Get a system author by ID
  static async getSystemAuthorById(id: string): Promise<SystemAuthor | null> {
    const authors = await this.getSystemAuthors();
    return authors.find(author => author.id === id) || null;
  }

  // Save a system author (create or update)
  static async saveSystemAuthor(author: Partial<SystemAuthor>): Promise<SystemAuthor> {
    await simulateNetworkDelay();
    const authors = await this.getSystemAuthors();
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
    
    await this.saveSystemAuthors(authors);
    return author.id ? 
      authors.find(a => a.id === author.id)! : 
      authors[authors.length - 1];
  }

  // Save multiple system authors
  static async saveSystemAuthors(authors: SystemAuthor[]): Promise<SystemAuthor[]> {
    await simulateNetworkDelay();
    localStorage.setItem(SYSTEM_AUTHORS_STORAGE_KEY, JSON.stringify(authors));
    return authors;
  }

  // Delete a system author
  static async deleteSystemAuthor(id: string): Promise<void> {
    await simulateNetworkDelay();
    const authors = await this.getSystemAuthors();
    const filteredAuthors = authors.filter(author => author.id !== id);
    await this.saveSystemAuthors(filteredAuthors);
  }
} 