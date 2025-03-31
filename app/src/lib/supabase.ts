import { createClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          pseudonym: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          pseudonym?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          pseudonym?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      system_authors: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
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
