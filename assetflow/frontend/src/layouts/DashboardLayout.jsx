import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const TITLES = {
  "/": "Dashboard",
  "/organization": "Organization Setup",
  "/assets": "Assets",
  "/assets/register": "Register Asset",
  "/allocation": "Allocation & Transfer",
  "/booking": "Resource Booking",
  "/maintenance": "Maintenance",
  "/audit": "Audit",
  "/reports": "Reports & Analytics",
  "/notifications": "Notifications",
};

export default function DashboardLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || "AssetFlow";

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
