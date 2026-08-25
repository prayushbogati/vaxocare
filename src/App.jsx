import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ScrollToTop from "./components/ScrollToTop";
import VaccineDashboard from "./pages/VaccineDashboard";
import OrgDashboard from "./pages/OrgDashboard";
import AdminDashboard from "./components/adminDashboard/AdminDashboard";
import { auth, api } from "./apis";

const requireAuth = (token) => Boolean(token);

const getToken = () => auth.getToken?.() || localStorage.getItem("token");

const roleToPath = (r) => {

  if (r === "admin") return "/adminDashboard";
  if (r === "provider") return "/orgDashboard";
  return "/dashboard";
};

const ProtectedRoute = ({ children, role }) => {
  const token = getToken();
  if (!requireAuth(token)) return <Navigate to="/login" replace />;


  const storedRole = localStorage.getItem("role") || auth.getRole?.() || null;

  // If we already have a role, use it synchronously.
  if (role && storedRole) {
    if (storedRole !== role) return <Navigate to={roleToPath(storedRole)} replace />;
    return children;
  }

  // If role is missing but we need to gate by it, derive it via /me.
  // This ensures Home -> Dashboard navigation always lands on the correct dashboard.
  if (role && !storedRole) {
    // NOTE: We can't do async directly in a render without state.
    // Instead we render a small guard component.
    const RoleDeriver = () => {
      const [redirectTo, setRedirectTo] = useState(null);

      useEffect(() => {
        let cancelled = false;
        api
          .me()
          .then((res) => {
            const r = res?.data?.role || res?.role || null;
            if (r) auth.setRole(r);
            const finalRole = r || localStorage.getItem("role") || null;

            if (!cancelled && finalRole && role && finalRole !== role) {
              setRedirectTo(roleToPath(finalRole));
            } else {
              setRedirectTo(null);
            }
          })
          .catch(() => {
            // If /me fails, fall back to existing behavior: allow parent dashboard.
            if (!cancelled) setRedirectTo(null);
          });

        return () => {
          cancelled = true;
        };
      }, []);

      if (redirectTo) return <Navigate to={redirectTo} replace />;
      return children;
    };

    return <RoleDeriver />;
  }

  // If no role gating requested, allow.
  return children;
};

function App() {
  return (
    <div className="text-gray-700 bg-gray-100">
      <BrowserRouter>
        <ScrollToTop />
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="parent">
                <VaccineDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orgDashboard"
            element={
              <ProtectedRoute role="provider">
                <OrgDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

