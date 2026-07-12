import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Organization from "./pages/Organization";
import Assets from "./pages/Assets";
import RegisterAsset from "./pages/RegisterAsset";
import AssetDetail from "./pages/AssetDetail";
import Allocation from "./pages/Allocation";
import Assistant from "./pages/Assistant";
import Maintenance from "./pages/Maintenance";
import Booking from "./pages/Booking";
import Audit from "./pages/Audit";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/register" element={<RegisterAsset />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/allocation" element={<Allocation />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </SocketProvider>
  );
}
