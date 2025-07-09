import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";

import Index from "./pages/Index";
import Login from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import JoinGroup from "./pages/JoinGroup";
import NotFound from "./pages/NotFound";
import QRScanner from "./pages/QRScanner";
import Payments from "./components/Payments/PaymentHistory";
import GroupDetails from "./components/Groups/GroupDetails"; // ✅ correct Lovable UI
import Profile from "./Profile/Profile";


const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while Firebase auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Loading SplitEase...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Index />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/create"
          element={
            <ProtectedRoute>
              <CreateGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/join"
          element={
            <ProtectedRoute>
              <JoinGroup />
            </ProtectedRoute>
          }
        />
        <Route
  path="/group/:groupId"
  element={
    <ProtectedRoute>
      <GroupDetails />
    </ProtectedRoute>
  }
/>

        <Route
          path="/qr"
          element={
            <ProtectedRoute>
              <QRScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
