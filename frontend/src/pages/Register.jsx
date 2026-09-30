import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguagePicker from "../components/LanguagePicker";

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_BASE = "http://127.0.0.1:8000";

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!userName || !shopName || !email || !password) {
      alert(t("auth.fillAll"));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || t("auth.registrationFailed"));
        return;
      }

      localStorage.setItem("shopName", shopName.trim());
      localStorage.setItem("userName", userName.trim());
      localStorage.setItem("name", userName.trim());
      localStorage.setItem("username", userName.trim());

      window.dispatchEvent(new Event("pos-profile-updated"));

      alert(t("auth.registrationSuccess"));
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(t("auth.connectionError"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

        <div className="mb-4 flex justify-end">
          <LanguagePicker />
        </div>

        {/* Header */}
        <div className="mb-6 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
            ✦
          </div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {t("auth.createAccount")}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {t("auth.registerSubtitle")}
          </p>

        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* User Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("auth.userName")}
            </label>

            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t("auth.enterName")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Shop Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("auth.shopName")}
            </label>

            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder={t("auth.enterShopName")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("auth.email")}
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.enterEmail")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("auth.password")}
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.createPassword")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
          >
            {t("auth.createAccount")}
          </button>

        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {t("auth.hasAccount")} {" "}

          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            {t("auth.login")}
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;