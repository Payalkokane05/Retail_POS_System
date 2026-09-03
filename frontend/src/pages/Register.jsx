import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!userName || !shopName || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    // Save registered user details
    localStorage.setItem("userName", userName.trim());
    localStorage.setItem("shopName", shopName.trim());
    localStorage.setItem("userEmail", email.trim());
    localStorage.setItem("userPassword", password);

    // Compatibility with older code
    localStorage.setItem("name", userName.trim());
    localStorage.setItem("username", userName.trim());

    // Tell Dashboard/profile components that registration is complete
    window.dispatchEvent(new Event("pos-profile-updated"));

    alert("Registration successful!");

    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-6 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
            ✦
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Create Account
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create your Retail POS account
          </p>

        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* User Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              User Name
            </label>

            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Shop Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Shop Name
            </label>

            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Enter shop name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Create Account
          </button>

        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;