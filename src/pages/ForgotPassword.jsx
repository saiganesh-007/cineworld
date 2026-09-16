import { useState } from "react";
import { Link } from "react-router-dom";

import { requestPasswordReset } from "../lib/auth";

import AuthBackdrop from "../components/AuthBackdrop";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const { error: resetError } = await requestPasswordReset(email);

      if (resetError) {
        setError(resetError.message || "Unable to send reset email.");
        return;
      }

      setSuccess(
        "Check your email for instructions to reset your password."
      );
    } catch (requestError) {
      console.error("Password reset error:", requestError);

      setError("Unable to send reset email. Please try again.");
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
            Forgot password?
          </h1>

          <p className="text-sm text-gray-500 mt-1.5">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {success ? (
          <form
            onSubmit={handleSubmit}
            className="
              bg-zinc-950/90
              backdrop-blur
              border
              border-green-500/20
              rounded-2xl
              p-6
              shadow-2xl
              shadow-black/70
              ring-1
              ring-black/40
              text-center
            "
          >
            <p className="text-green-400 text-lg font-semibold">
              Reset link sent
            </p>

            <p className="text-gray-400 text-sm mt-3">
              {success}
            </p>

            <p className="text-center text-gray-500 text-sm mt-6">
              Remembered your password?{" "}

              <Link
                to="/login"
                className="text-red-500 hover:text-red-400"
              >
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
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

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
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

            <button
              type="submit"
              disabled={loading}
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
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center text-gray-500 text-sm mt-5">
              Remembered your password?{" "}

              <Link
                to="/login"
                className="text-red-500 hover:text-red-400"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

export default ForgotPassword;