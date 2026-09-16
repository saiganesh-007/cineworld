import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

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

    try {
      setLoading(true);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Register error:", error);

      setError(
        "Unable to connect to CINEWorld server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-3xl font-bold text-white"
          >
            CINE
            <span className="text-red-500">
              World
            </span>
          </Link>

          <h1 className="text-white text-3xl font-bold mt-8">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Join CINEWorld today
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-zinc-950 border border-white/10 rounded-2xl p-7 space-y-5"
        >

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm password"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}

            <Link
              to="/login"
              className="text-red-500 hover:text-red-400"
            >
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Register;