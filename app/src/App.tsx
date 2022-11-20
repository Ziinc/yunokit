import { BrowserRouter } from "react-router-dom";
import { client } from "./utils";
import AuthSection from "./components/AuthSection";
import AuthedApp from "./AuthedApp";
import { Auth } from "@supabase/auth-ui-react";

const App = () => {
  return (
    <BrowserRouter basename={process.env.BASE_PATH || undefined}>
      <Auth.UserContextProvider supabaseClient={client}>
        <main className="flex flex-col h-screen ">
          <Gateway />
        </main>
      </Auth.UserContextProvider>
    </BrowserRouter>
  );
};

const Gateway = () => {
  const user = Auth.useUser();
  if (!user) {
    return <AuthSection />;
  }
  return <AuthedApp />;
};

export default App;
