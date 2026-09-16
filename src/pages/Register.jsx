import { useState } from "react";
import { Link } from "react-router-dom";

import { isSupabaseConfigured } from "../lib/supabaseClient";
import { signUpWithEmail } from "../lib/auth";

import AuthBackdrop from "../components/AuthBackdrop";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
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

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } = await signUpWithEmail({
        email,
        password,
        username,
      });

      if (signUpError) {
        setError(
          signUpError.message || "Unable to create your account. Please try again."
        );
        return;
      }

      if (!data?.user) {
        setError("Unable to create your account. Please try again.");
        return;
      }

      setSuccess("Check your email to verify your account.");
    } catch (registerError) {
      console.error("Register error:", registerError);

      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-black text-white flex items-center justify-center px-6 py-14 overflow-hidden">
      <AuthBackdrop />

      <div className="relative z-20 w-full max-w-sm">

        {/* ==========================================
            CARD SIDE GLOWS (cinematic bloom)
        ========================================== */}

        <div
          aria-hidden="true"
          className="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 w-20 sm:w-24 h-2/3 rounded-full bg-red-600/25 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 w-20 sm:w-24 h-2/3 rounded-full bg-red-600/25 blur-3xl pointer-events-none"
        />

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold">
            Create your account
          </h1>

          <p className="text-sm text-gray-500 mt-1.5">
            Join CINEWorld and start building your watchlist.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="
            bg-zinc-950/90
            backdrop-blur
            border
            border-white/10
            rounded-2xl
            p-5
            shadow-2xl
            shadow-black/70
            ring-1
            ring-black/40
          "
        >

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-4 py-3 text-sm mb-4">
              {success}
            </div>
          )}

          <div className="space-y-4">

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter username"
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
                "
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter email"
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
                "
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
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
                "
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm password"
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
                "
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              mt-5
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
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p className="text-center text-gray-500 text-sm mt-5">
            Already have an account?{" "}

            <Link
              to="/login"
              className="text-red-500 hover:text-red-400"
            >
              Sign in
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
}

export default Register;