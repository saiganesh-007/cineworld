import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { isSupabaseConfigured } from "../lib/supabaseClient";
import {
  getSession,
  onAuthStateChange,
} from "../lib/auth";

function AuthCallback() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("Completing sign-in...");
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe = () => {};

    async function completeAuth() {
      if (!isSupabaseConfigured()) {
        setError(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local."
        );
        return;
      }

      const {
        data: { subscription },
      } = onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          navigate("/reset-password", { replace: true });
          return;
        }

        if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          setStatus("Email confirmed. You can now log in.");
        }
      });

      unsubscribe = () => subscription.unsubscribe();

      const { session, error: sessionError } = await getSession();

      if (sessionError) {
        setError(
          sessionError.message || "Unable to complete authentication."
        );
        return;
      }

      if (session) {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");

        if (type === "recovery") {
          navigate("/reset-password", { replace: true });
          return;
        }

        setStatus("Authentication complete.");
        return;
      }

      setStatus("No active session was found.");
    }

    completeAuth();

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6">
          {error ? (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              {status}
            </p>
          )}

          <Link
            to="/login"
            className="inline-block mt-6 text-red-500 hover:text-red-400 text-sm"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default AuthCallback;
