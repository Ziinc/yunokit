import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, signOut } from '@/lib/supabase';

export interface User {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  providers?: {
    id: string;
    provider: string;
    avatarUrl?: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, check if user is authenticated with Supabase
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        setIsLoading(true);
        
        // Get the initial session
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          // Get user data from Supabase
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // Format the user data
            const formattedUser: User = {
              id: userData.user.id,
              email: userData.user.email || undefined,
              username: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'User',
              avatarUrl: userData.user.user_metadata?.avatar_url,
              providers: userData.user.identities?.map(identity => ({
                id: identity.id,
                provider: identity.provider,
                avatarUrl: identity.identity_data?.avatar_url
              })) || [],
            };
            
            setUser(formattedUser);
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);
      
      if (event === 'SIGNED_IN' && session) {
        // Get user data
        const { data } = await supabase.auth.getUser();
        
        if (data?.user) {
          // Format the user data
          const formattedUser: User = {
            id: data.user.id,
            email: data.user.email || undefined,
            username: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            avatarUrl: data.user.user_metadata?.avatar_url,
            providers: data.user.identities?.map(identity => ({
              id: identity.id,
              provider: identity.provider,
              avatarUrl: identity.identity_data?.avatar_url
            })) || [],
          };
          
          setUser(formattedUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      setIsLoading(false);
    });
    
    // Clean up the listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      // Navigate to sign-in page after sign out
      navigate('/sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
