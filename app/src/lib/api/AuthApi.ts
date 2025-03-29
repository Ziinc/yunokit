interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
}

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: 'https://i.pravatar.cc/150?u=admin',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Editor User',
    email: 'editor@example.com',
    avatar: 'https://i.pravatar.cc/150?u=editor',
    role: 'editor',
    createdAt: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Viewer User',
    email: 'viewer@example.com',
    avatar: 'https://i.pravatar.cc/150?u=viewer',
    role: 'viewer',
    createdAt: '2023-01-03T00:00:00Z'
  }
];

// Storage keys
const AUTH_STORAGE_KEY = 'supacontent-auth';
const USERS_STORAGE_KEY = 'supacontent-users';

// Simulate network delay
const simulateNetworkDelay = async (minMs: number = 300, maxMs: number = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * AuthApi - Provides methods for user authentication and management
 * Uses localStorage for persistence in the demo
 */
export class AuthApi {
  // Initialize storage with mock users if empty
  static async initializeStorage(): Promise<void> {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
      console.log("Initialized users storage with mock users");
    }
  }

  // Get the current auth state from storage
  static getAuthState(): AuthState {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) {
      return { user: null, token: null, expiresAt: null };
    }
    return JSON.parse(authData);
  }

  // Check if the user is authenticated and the token is valid
  static isAuthenticated(): boolean {
    const { user, token, expiresAt } = this.getAuthState();
    if (!user || !token || !expiresAt) {
      return false;
    }
    return expiresAt > Date.now();
  }

  // Get the current user
  static getCurrentUser(): User | null {
    const { user } = this.getAuthState();
    return user;
  }

  // Get the users list
  private static async getUsers(): Promise<User[]> {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    if (!users) {
      return [];
    }
    return JSON.parse(users);
  }

  // Sign in a user with email and password
  static async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    await simulateNetworkDelay();
    
    // In a real app, this would validate against a real backend
    // For demo purposes, we accept any of the mock users with any password
    const users = await this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Generate a mock token (this would be a real JWT in a production app)
    const token = `mock-jwt-token-${Date.now()}`;
    
    // Set expiration to 1 day from now
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    
    // Update last login time
    user.lastLogin = new Date().toISOString();
    
    // Save updated users list
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    // Save auth state to localStorage
    const authState: AuthState = {
      user,
      token,
      expiresAt
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    
    return { user, token };
  }

  // Sign out the current user
  static async signOut(): Promise<void> {
    await simulateNetworkDelay(100, 500);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  // Register a new user
  static async register(name: string, email: string, password: string): Promise<User> {
    await simulateNetworkDelay();
    
    // Check if user already exists
    const users = await this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role: 'viewer', // Default role for new users
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...users, newUser]));
    
    return newUser;
  }

  // Update a user's profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await simulateNetworkDelay();
    
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user data, but don't allow changing the role or id
    const { role, id, ...allowedUpdates } = updates;
    users[userIndex] = { ...users[userIndex], ...allowedUpdates };
    
    // Save updated users list
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    // If this is the current user, update auth state
    const authState = this.getAuthState();
    if (authState.user && authState.user.id === userId) {
      authState.user = users[userIndex];
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    }
    
    return users[userIndex];
  }

  // Admin function to change a user's role
  static async changeUserRole(userId: string, newRole: 'admin' | 'editor' | 'viewer'): Promise<User> {
    await simulateNetworkDelay();
    
    // Check if current user is admin
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Permission denied: Only admins can change user roles');
    }
    
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user role
    users[userIndex].role = newRole;
    
    // Save updated users list
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return users[userIndex];
  }
}

export type { User, AuthState }; 