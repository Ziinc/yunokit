import { createClient } from '@supabase/supabase-js';
import { generateState } from '@/utils/auth';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          pseudonym: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          pseudonym?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          pseudonym?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      system_authors: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          members: {
            id: string;
            user_id: string;
            role: 'owner' | 'admin' | 'member';
            email: string;
            name: string;
          }[];
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          members: {
            id: string;
            user_id: string;
            role: 'owner' | 'admin' | 'member';
            email: string;
            name: string;
          }[];
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          members?: {
            id: string;
            user_id: string;
            role: 'owner' | 'admin' | 'member';
            email: string;
            name: string;
          }[];
        };
      };
      content_schemas: {
        Row: {
          id: string;
          name: string;
          description: string;
          fields: any[];
          is_collection: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          fields: any[];
          is_collection: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          fields?: any[];
          is_collection?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          workspace_id?: string;
        };
      };
      content_items: {
        Row: {
          id: string;
          title: string;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
          schema_id: string;
          workspace_id: string;
          data: any;
        };
        Insert: {
          id?: string;
          title: string;
          status: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by: string;
          schema_id: string;
          workspace_id: string;
          data: any;
        };
        Update: {
          id?: string;
          title?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
          schema_id?: string;
          workspace_id?: string;
          data?: any;
        };
      };
    };
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if credentials are missing
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signInWithOAuth: () => Promise.resolve({ data: null, error: new Error('Supabase credentials missing') }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase credentials missing') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Supabase credentials missing') }),
        resetPasswordForEmail: () => Promise.resolve({ data: null, error: new Error('Supabase credentials missing') }),
        updateUser: () => Promise.resolve({ data: null, error: new Error('Supabase credentials missing') }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        upsert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      })
    };

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Auth and storage features will not work.');
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Authentication helpers
export const signInWithGithub = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: new Error('Supabase credentials missing') };
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: new Error('Supabase credentials missing') };
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signInWithMicrosoft = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: new Error('Supabase credentials missing') };
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: null };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

// User profile functions
export const getUserProfile = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get additional profile data from a profiles table if needed
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return {
    id: user.id,
    email: user.email,
    avatarUrl: user.user_metadata?.avatar_url,
    username: profile?.username || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    providers: user.identities?.map(identity => ({
      id: identity.id,
      provider: identity.provider,
      avatarUrl: identity.identity_data?.avatar_url
    })) || [],
    ...profile
  };
};

export const updateUsername = async (userId: string, username: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: null };
  }
  
  // Call the upsert method directly from the supabase instance
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, username, updated_at: new Date() })
    .select()
    .single();
    
  return { data, error };
};

// Supabase project management (for admin settings)
export const getProjects = async () => {
  // This would be implemented with Supabase Management API
  // but for now we'll return mock data
  return {
    data: [
      { id: 'proj1', name: 'Production', region: 'us-west-1', isConnected: true },
      { id: 'proj2', name: 'Staging', region: 'eu-west-2', isConnected: false },
      { id: 'proj3', name: 'Development', region: 'ap-southeast-1', isConnected: false }
    ]
  };
};

// Email/password authentication
export const signInWithEmail = async (email: string, password: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: new Error('Supabase credentials missing') };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: new Error('Supabase credentials missing') };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const resetPassword = async (email: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: new Error('Supabase credentials missing') };
  }
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: new Error('Supabase credentials missing') };
  }
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
};

export const updateEmail = async (newEmail: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: new Error('Supabase credentials missing') };
  }
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail
  });
  return { data, error };
};

const SUPABASE_API_URL = 'https://api.supabase.com/api/v1';

// Types
export interface SupabaseTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  project: {
    id: string;
    name: string;
    region: string;
    organization_id: string;
  };
}

export interface SupabaseProject {
  id: string;
  name: string;
  region: string;
  organization_id: string;
  created_at: string;
  last_synced_at?: string;
}

// OAuth configuration
const config = {
  clientId: import.meta.env.VITE_SUPABASE_CLIENT_ID,
  redirectUri: `${window.location.origin}/settings/supabase/callback`,
  scope: 'all',
  authorizationEndpoint: 'https://api.supabase.com/oauth/authorize',
  tokenEndpoint: 'https://api.supabase.com/oauth/token',
};

// OAuth utilities
export const initiateOAuthFlow = () => {
  const state = generateState();
  localStorage.setItem('supabase_oauth_state', state);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  });

  window.location.href = `${config.authorizationEndpoint}?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string, state: string): Promise<SupabaseTokenResponse> => {
  const savedState = localStorage.getItem('supabase_oauth_state');
  if (!savedState || savedState !== state) {
    throw new Error('Invalid state parameter');
  }

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const data = await response.json();
  return data;
};

// API utilities
export const getProjectDetails = async (accessToken: string): Promise<SupabaseProject> => {
  const response = await fetch(`${SUPABASE_API_URL}/projects`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project details');
  }

  const projects = await response.json();
  return projects[0]; // Get the first project
};

// Token management
export const storeTokens = (tokens: SupabaseTokenResponse) => {
  localStorage.setItem('supabase_access_token', tokens.access_token);
  localStorage.setItem('supabase_refresh_token', tokens.refresh_token);
  localStorage.setItem('supabase_token_expiry', (Date.now() + tokens.expires_in * 1000).toString());
  localStorage.setItem('supabase_project_id', tokens.project.id);
  localStorage.setItem('supabase_project_name', tokens.project.name);
  localStorage.setItem('supabase_project_region', tokens.project.region);
  localStorage.setItem('supabase_connected', 'true');
};

export const clearTokens = () => {
  localStorage.removeItem('supabase_access_token');
  localStorage.removeItem('supabase_refresh_token');
  localStorage.removeItem('supabase_token_expiry');
  localStorage.removeItem('supabase_project_id');
  localStorage.removeItem('supabase_project_name');
  localStorage.removeItem('supabase_project_region');
  localStorage.removeItem('supabase_connected');
  localStorage.removeItem('supabase_oauth_state');
};

export const refreshTokens = async (): Promise<SupabaseTokenResponse> => {
  const refreshToken = localStorage.getItem('supabase_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const tokens = await response.json();
  storeTokens(tokens);
  return tokens;
};

export const getValidAccessToken = async (): Promise<string> => {
  const accessToken = localStorage.getItem('supabase_access_token');
  const tokenExpiry = localStorage.getItem('supabase_token_expiry');

  if (!accessToken || !tokenExpiry) {
    throw new Error('No access token available');
  }

  if (Date.now() > parseInt(tokenExpiry)) {
    const newTokens = await refreshTokens();
    return newTokens.access_token;
  }

  return accessToken;
};
