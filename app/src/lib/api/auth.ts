import { supabase } from "@/lib/supabase";
export const signInWithGithub = async () => {
    throw new Error("Not implemented");
  };
  
export const signInWithGoogle = async () => {
  const params = new URLSearchParams(window.location.search);
  if (import.meta.env.DEV && params.get('email') === 'demo@example.com') {
    const session = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@example.com',
        app_metadata: { provider: 'email' },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    };
    localStorage.setItem('sb-127-auth-token', JSON.stringify(session));
    localStorage.setItem('currentWorkspaceId', '1');
    return { data: null, error: null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  return { data, error };
};
  
  export const signInWithMicrosoft = async () => {
    throw new Error("Not implemented");
  };
  
  export const signOut = async () => {
    return await supabase.auth.signOut();
  };
  
  export const refreshSession = async () => {
    return await supabase.auth.refreshSession();
  };
  // User profile functions
  export const getUser = async () => {
    return await supabase.auth.getUser();
  };

  export const isAuthenticated = async () => {
    const {data} = await getUser();
    return !!data.user;
  };
  
  export const updateUsername = async (
    userId: string,
    username: string
  ) => {
    void userId;
    void username;
    throw new Error("Not implemented");
  };
  
  export const signInWithEmail = async (_email: string, _password: string) => {
    void _email;
    void _password;
    throw new Error("not implemented");
  };
  
  export const signUpWithEmail = async (_email: string, _password: string) => {
    void _email;
    void _password;
    throw new Error("not implemented");
  };
  
  export const resetPassword = async (_email: string) => {
    void _email;
    throw new Error("not implemented");
  };
  
  export const updatePassword = async (_newPassword: string) => {
    void _newPassword;
    throw new Error("not implemented");
  };
  
  export const updateEmail = async (_newEmail: string) => {
    void _newEmail;
    throw new Error("not implemented");
  };
  