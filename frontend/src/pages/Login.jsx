import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!shopName.trim()) {
      setError("Please enter shop name.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    // Save login details
    localStorage.setItem("isLoggedIn", "true");

    // IMPORTANT:
    // Save shop name so Dashboard can use it
    localStorage.setItem("shopName", shopName.trim());

    // Save user information
    localStorage.setItem("userName", email.split("@")[0]);

    // Go to Dashboard
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

        {/* LOGO */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
            ✦
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Smart Retail POS
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* SHOP NAME */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Shop Name
            </label>

            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Enter your shop name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* LOGIN */}
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        {/* REGISTER */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;