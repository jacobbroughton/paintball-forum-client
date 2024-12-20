import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function SupabaseProvider({ children }) {
  const supabase = createClient(
    "https://mrczauafzaqkmjtqioan.supabase.co",
    import.meta.env.VITE_SUPABASE_API_KEY,
    { multiTab: false }
  );
  const navigate = useNavigate();

  const onAuthStateChange = (callback) => {
    let currentSession;
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id == currentSession?.user?.id) return;
      currentSession = session;
      callback(event);
    });
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((event) => {
      switch (event) {
        case "SIGNED_OUT":
          navigate("auth/login");
          break;
        case "SIGNED_IN":
          navigate("/");
          break;
        default:
          // router.refresh()
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Context.Provider value={{ supabase }}>
      <>{children}</>
    </Context.Provider>
  );
}
