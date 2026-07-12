import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ComingSoon from "./components/ComingSoon";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Organization from "./pages/Organization";
import Assets from "./pages/Assets";
import RegisterAsset from "./pages/RegisterAsset";
import AssetDetail from "./pages/AssetDetail";
import Allocation from "./pages/Allocation";
import Maintenance from "./pages/Maintenance";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/register" element={<RegisterAsset />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/allocation" element={<Allocation />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route
          path="/booking"
          element={<ComingSoon title="Resource Booking" description="Calendar and timeline booking with overlap detection is next on the roadmap for this build." />}
        />
        <Route
          path="/audit"
          element={<ComingSoon title="Asset Audit" description="Audit cycles, checklists, and discrepancy reports are next on the roadmap for this build." />}
        />
        <Route
          path="/reports"
          element={<ComingSoon title="Reports & Analytics" description="Utilization, maintenance trend, and export-ready reports are next on the roadmap for this build." />}
        />
        <Route
          path="/notifications"
          element={<ComingSoon title="Notifications" description="Real-time notifications are wired up on the backend via Socket.io — the feed UI is next." />}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
