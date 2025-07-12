import { supabase } from "@/lib/supabase";
export const signInWithGithub = async () => {
    throw new Error("Not implemented");
  };
  
  export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
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
  