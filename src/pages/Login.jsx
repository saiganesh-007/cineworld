import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem(
        "cineworld_user",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(
        new Event("cineworld-login")
      );

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to CINEWorld server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-3xl font-bold"
          >
            CINE
            <span className="text-red-500">
              World
            </span>
          </Link>

          <h1 className="text-2xl font-semibold mt-8">
            Welcome back
          </h1>

          <p className="text-gray-500 mt-2">
            Login to your CINEWorld account
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

          <div className="mb-5">
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

          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
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

          <div className="text-right mb-5">
            <Link
              to="/forgot-password"
              className="
                text-sm
                text-red-500
                hover:text-red-400
              "
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

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
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-red-500 hover:text-red-400"
            >
              Create one
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
}

export default Login;