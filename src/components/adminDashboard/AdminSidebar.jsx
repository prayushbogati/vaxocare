import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  Users,
  Building2,
  Bell,
  BarChart2,
  Settings,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { cn } from "./UI";

const NAV = [
  { id: "overview", label: "Admin Overview", icon: LayoutGrid },
  { id: "users", label: "Manage Users & Roles", icon: Users },
  { id: "providers", label: "Provider Approvals", icon: Building2 },
  { id: "vaccines", label: "Vaccine Management", icon: ShieldAlert },
  { id: "audit", label: "Audit Logs", icon: ShieldAlert },
  { id: "notifications", label: "Send Notifications", icon: Bell },
  { id: "reports", label: "Export Reports", icon: BarChart2 },
  { id: "settings", label: "System Settings", icon: Settings },
];

const AdminSidebar = ({
  view,
  switchView,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!userMenuRef.current) return;
      if (userMenuRef.current.contains(e.target)) return;
      setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static left-0 top-14 bottom-0 z-20 w-60 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 overflow-hidden h-[calc(100vh-3.5rem)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="pt-2 pb-3 px-2 space-y-0.5 overflow-y-auto flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2">
              Administration
            </p>

            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setUserMenuOpen(false);
                  switchView(id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 text-left",
                  view === id
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
                )}
                type="button"
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0",
                    view === id ? "text-blue-700" : "text-gray-500",
                  )}
                />
                <span className="flex-1">{label}</span>
              </button>
            ))}

            <div className="mx-3 mb-4 mt-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-700">
                  System Online
                </span>
              </div>
              <p className="text-[11px] text-green-600 mt-0.5">
                All services running
              </p>
            </div>
          </div>

          <div className="px-2 pb-4 border-t border-gray-100 pt-3">
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((s) => !s)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer border-0"
                aria-label="Open user menu"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-bold shrink-0">
                  AD
                </div>
                <span className="text-gray-700 text-sm font-semibold hidden lg:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute left-0 right-0 bottom-12 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      switchView("settings");
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer border-0 text-left",
                    )}
                  >
                    <span className="text-gray-600">Profile</span>
                    <span className="ml-auto text-xs text-gray-400">
                      System Settings
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 text-left",
                    )}
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
