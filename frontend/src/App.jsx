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
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

function MainLayout() {
  const [desktopSidebarOpen, setDesktopSidebarOpen] = React.useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setDesktopSidebarOpen((open) => !open);
      return;
    }
    setMobileSidebarOpen((open) => !open);
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* FIXED SIDEBAR */}
      <Sidebar
        desktopOpen={desktopSidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onToggleDesktop={() => setDesktopSidebarOpen((open) => !open)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <Navbar
        shopName={localStorage.getItem("shopName") || "Shree Ganesh Grocery"}
        userName={
          localStorage.getItem("userName") ||
          localStorage.getItem("name") ||
          localStorage.getItem("username") ||
          "User"
        }
        sidebarExpanded={desktopSidebarOpen}
        onOpenMenu={toggleSidebar}
      />

      {/* PAGE CONTENT */}
      <main
        className={`min-h-screen min-w-0 overflow-x-hidden pt-[68px] transition-[margin] duration-300 ${
          desktopSidebarOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        <Routes>

          <Route
            path="/dashboard"
            element={
              <Dashboard
                sidebarExpanded={desktopSidebarOpen}
              />
            }
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
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />

        </Routes>

      </BrowserRouter>

    </LanguageProvider>
  );
}

export default App;