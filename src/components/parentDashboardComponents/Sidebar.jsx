import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Users, Calendar, Syringe, User, Settings, LogOut } from "lucide-react";
import { cn } from "./UI";
import { api } from "../../apis";

const NAV = [
  { id: "dashboard", label: "Overview", icon: LayoutGrid },
  { id: "children", label: "My Children", icon: Users },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "vaccines", label: "Vaccine Records", icon: Syringe },
];
const NAV2 = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({
  view,
  switchView,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}) => {
  const [childrenCount, setChildrenCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.listChildren();
        const list = res?.data ?? res ?? [];
        if (mounted) setChildrenCount(Array.isArray(list) ? list.length : 0);
      } catch {
        if (mounted) setChildrenCount(0);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const navWithBadges = useMemo(() => {
    return NAV.map((item) => {
      if (item.id !== "children") return item;
      return { ...item, badge: childrenCount > 0 ? String(childrenCount) : null };
    });
  }, [childrenCount]);

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
          "fixed lg:static inset-y-0 left-0 top-16 z-20 w-60 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="pt-2 pb-3 px-2 space-y-0.5">
            {navWithBadges.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => switchView(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 text-left",
                  view === id
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0",
                    view === id ? "text-blue-700" : "text-gray-500"
                  )}
                />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            ))}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2 pt-4">
              Account
            </p>
            {NAV2.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => switchView(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 text-left",
                  view === id
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0",
                    view === id ? "text-blue-700" : "text-gray-500"
                  )}
                />
                {label}
              </button>
            ))}
          </div>
          <div className="mt-auto px-2 pb-4 border-t border-gray-100 pt-3">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;