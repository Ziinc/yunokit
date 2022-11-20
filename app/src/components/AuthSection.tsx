import { client } from "../utils";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

const AuthSection = () => (
  <Auth
    supabaseClient={client}
    redirectTo="https://localhost:3000/refresh"
    appearance={{ theme: ThemeSupa }}
  />
);
export default AuthSection;
