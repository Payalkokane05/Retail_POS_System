import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguagePicker from "../components/LanguagePicker";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const API_BASE = "http://127.0.0.1:8000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!shopName.trim()) {
      setError(t("auth.enterShopName"));
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError(`${t("auth.enterEmail")} / ${t("auth.enterPassword")}`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || t("auth.loginFailed"));
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", data.token);
      localStorage.setItem("shopName", shopName.trim());
      localStorage.setItem("userName", data.name);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(t("auth.connectionError"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

        <div className="mb-4 flex justify-end">
          <LanguagePicker />
        </div>

        {/* LOGO */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
            ✦
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {t("auth.loginTitle")}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {t("auth.loginSubtitle")}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* SHOP NAME */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("auth.shopName")}
            </label>

            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder={t("auth.enterShopName")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("auth.email")}
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.enterEmail")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("auth.password")}
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.enterPassword")}
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
            {t("auth.login")}
          </button>
        </form>

        {/* REGISTER */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {t("auth.noAccount")} {" "}

          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            {t("auth.register")}
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;