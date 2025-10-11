import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { refreshSession, getUser, signOut } from "@/lib/api/auth";
import { useNullableState } from "@/hooks/useNullableState";
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useNullableState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadAuthState = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await getUser();
      if (userData?.user) {
        setUser(userData.user);
      } else {
        await refreshSession();
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // check auth state
    loadAuthState();

    // listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user;

        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          setUser(user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      navigate("/sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
