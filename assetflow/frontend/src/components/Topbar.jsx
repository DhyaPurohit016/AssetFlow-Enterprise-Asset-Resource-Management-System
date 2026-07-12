import { useEffect, useState } from "react";
import { Search, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Topbar({ title }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        navigate("/assets");
        setShowHint(true);
        setTimeout(() => setShowHint(false), 1500);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <header className="h-16 border-b border-surface-700 flex items-center justify-between px-6 sticky top-0 bg-surface-950/80 backdrop-blur z-10">
      <h1 className="font-display font-semibold text-lg text-ink-50">{title}</h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/assets")}
          className="hidden sm:flex items-center gap-2 text-sm text-ink-400 bg-surface-800 border border-surface-600 rounded-lg px-3 py-1.5 hover:text-ink-50 transition-colors"
        >
          <Search size={14} />
          Search assets, employees...
          <kbd className="ml-3 text-[10px] px-1.5 py-0.5 rounded bg-surface-700 text-ink-400">Ctrl K</kbd>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sage-900 text-sage-400 flex items-center justify-center text-xs font-medium">
            {user?.name?.charAt(0) || "?"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-ink-50 leading-tight">{user?.name}</p>
            <p className="text-xs text-ink-400 leading-tight">{user?.role}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="p-2 text-ink-400 hover:text-maroon-400 transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
