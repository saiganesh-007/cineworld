import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { isSupabaseConfigured } from "../lib/supabaseClient";
import {
  getSession,
  onAuthStateChange,
  updatePassword,
} from "../lib/auth";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let unsubscribe = () => {};

    async function loadSession() {
      if (!isSupabaseConfigured()) {
        setError(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local."
        );
        setCheckingSession(false);
        return;
      }

      const {
        data: { subscription },
      } = onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || session) {
          setHasRecoverySession(true);
          setCheckingSession(false);
        }
      });

      unsubscribe = () => subscription.unsubscribe();

      const { session, error: sessionError } = await getSession();

      if (sessionError) {
        setError(
          sessionError.message || "Unable to verify reset session."
        );
        setCheckingSession(false);
        return;
      }

      if (session) {
        setHasRecoverySession(true);
      }

      setCheckingSession(false);
    }

    loadSession();

    return () => {
      unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        setError(updateError.message || "Unable to update password.");
        return;
      }

      setSuccess("Password updated. You can now log in.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (updateException) {
      console.error("Update password error:", updateException);

      setError("Unable to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold">
            Reset password
          </h1>

          <p className="text-gray-500 mt-2">
            Choose a new password for your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            bg-zinc-950
            border
            border-white/10
            rounded-2xl
            p-6
          "
        >
          {error && (
            <div className="text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm mb-4">
              {success}
            </div>
          )}

          {checkingSession && (
            <p className="text-gray-500 text-sm mb-4">
              Checking reset link...
            </p>
          )}

          {!checkingSession && !hasRecoverySession && !error && (
            <p className="text-gray-500 text-sm mb-4">
              This reset link is invalid or has expired. Request a new one.
            </p>
          )}

          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2">
              New password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter new password"
              disabled={!hasRecoverySession || loading}
              className="
                w-full
                bg-black
                border
                border-white/10
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-red-500
                disabled:opacity-50
              "
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2">
              Confirm password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm new password"
              disabled={!hasRecoverySession || loading}
              className="
                w-full
                bg-black
                border
                border-white/10
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-red-500
                disabled:opacity-50
              "
            />
          </div>

          <button
            type="submit"
            disabled={!hasRecoverySession || loading}
            className="
              w-full
              bg-red-600
              hover:bg-red-700
              disabled:opacity-50
              text-white
              font-semibold
              py-3
              rounded-lg
              transition
            "
          >
            {loading ? "Updating..." : "Update password"}
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            <Link
              to="/forgot-password"
              className="text-red-500 hover:text-red-400"
            >
              Request a new reset link
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default ResetPassword;
