import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { LanguageProvider } from "./context/LanguageContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Bills from "./pages/Billis";
import Sidebar from "./components/Sidebar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* FIXED SIDEBAR */}
      <Sidebar />

      {/* PAGE CONTENT */}
      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">
        <Routes>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
          <Route path="/bills" element={<Bills />} />
        </Routes>
      </main>

    </div>
  );
}

function App() {
  return (
    <LanguageProvider>

      <BrowserRouter>

        <Routes>

          {/* LOGIN */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* REGISTER */}
          <Route
            path="/register"
            element={<Register />}
          />

          {/* MAIN APPLICATION */}
          <Route
            path="/*"
            element={<MainLayout />}
          />

        </Routes>

      </BrowserRouter>

    </LanguageProvider>
  );
}

export default App;