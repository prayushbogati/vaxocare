import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Building2,
  Syringe,
  Calendar,
  Activity,
  BadgeCheck,
  Badge,
  Bell,
  BarChart2,
  Settings,
  ShieldAlert,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import ManageUsersSection from "./ManageUsersSection";
import ProviderApprovalsSection from "./ProviderApprovalsSection";
import AuditLogsSection from "./AuditLogsSection";
import NotificationsSection from "./NotificationsSection";
import ReportsSection from "./ReportsSection";
import SystemSettingsSection from "./SystemSettingsSection";
import VaccinesSection from "./VaccinesSection";
import { api, auth } from "../../apis";
import { Btn, StatCard, cn } from "./UI";

const AdminDashboard = () => {
  const [view, setView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "info") => setToast({ msg, type });

  const onLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore API failures; still clear local session
    } finally {
      auth.clearToken();
      setSidebarOpen(false);
      window.location.href = "/login";
    }
  };

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  const viewIds = useMemo(
    () => [
      "overview",
      "users",
      "providers",
      "audit",
      "notifications",
      "reports",
      "settings",
    ],
    [],
  );

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const [s, pending, logs] = await Promise.all([
          api.adminDashboardStats?.(),
          api.adminProvidersPending?.(),
          api.adminAuditLogs?.(1, 5),
        ]);

        if (!mounted) return;

        setStats(s ?? null);
        setPendingProviders(
          Array.isArray(pending) ? pending : (pending?.data ?? []),
        );

        // adminAuditLogs returns { logs, pagination } (backend)
        const parsedLogs =
          Array.isArray(logs)
            ? logs
            : Array.isArray(logs?.logs)
              ? logs.logs
              : Array.isArray(logs?.data)
                ? logs.data
                : [];
        setRecentLogs(parsedLogs);
      } catch (e) {
        if (!mounted) return;
        showToast(e?.message || "Failed to load admin overview", "danger");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const overview = (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            System-wide summary of VaxoCare —{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <Btn variant="outline" size="sm" onClick={() => setView("reports")}>
          Full report
        </Btn>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          iconColor="blue"
          value={stats?.totalChildren ?? (loading ? "…" : "—")}
          label="Total Children"
          sub={stats?.completionRate ? `Completion ${stats.completionRate}%` : "—"}
          trend={undefined}
        />

        <StatCard
          icon={Syringe}
          iconColor="green"
          value={stats?.totalVaccines ?? (loading ? "…" : "—")}
          label="Vaccinations"
          sub={
            typeof stats?.completionRate !== "undefined"
              ? `Completion ${stats.completionRate}%`
              : "—"
          }
          trend={undefined}
        />

        <StatCard
          icon={Activity}
          iconColor="purple"
          value={stats?.completedVaccines ?? (loading ? "…" : "—")}
          label="Completed Vaccinations"
          sub={
            typeof stats?.pendingVaccines !== "undefined"
              ? `${stats.pendingVaccines} pending`
              : "—"
          }
          trend={undefined}
        />

        <StatCard
          icon={Calendar}
          iconColor="yellow"
          value={stats?.overdueVaccines ?? (loading ? "…" : "—")}
          label="Overdue Vaccinations"
          sub={
            typeof stats?.pendingVaccines !== "undefined"
              ? `${stats.pendingVaccines} pending`
              : "—"
          }
          trend={undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              Pending Provider Approvals
            </h3>
            <Btn
              variant="primary"
              size="sm"
              onClick={() => setView("providers")}
            >
              Review all
            </Btn>
          </div>

          <div className="divide-y divide-gray-100">
            {pendingProviders.length === 0 ? (
              <div className="px-5 py-4 text-sm text-gray-500">
                {loading ? "Loading…" : "No pending providers."}
              </div>
            ) : (
              pendingProviders.slice(0, 6).map((p) => (
                <div
                  key={p._id || p.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50"
                >
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-purple-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {p.name || p.providerName || "Provider"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.location || p.city || "—"} · Submitted{" "}
                      {p.submittedAt
                        ? new Date(p.submittedAt).toLocaleDateString()
                        : p.submitted || "—"}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 shrink-0">
                    Pending
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
            <Btn variant="outline" size="sm" onClick={() => setView("audit")}>
              Audit logs
            </Btn>
          </div>

          <div className="divide-y divide-gray-50">
            {recentLogs.length === 0 ? (
              <div className="px-5 py-4 text-sm text-gray-500">
                {loading ? "Loading…" : "No activity yet."}
              </div>
            ) : (
              recentLogs.slice(0, 5).map((l) => (
                <div
                  key={l._id || l.id || l.time}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50"
                >
                  <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">
                        {l.user ||
                          l.actor ||
                          l.userId?.name ||
                          l.userId?.email ||
                          "—"}
                      </span>{" "}
                      — {l.description || l.action || "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {l.time || l.timestamp || l.createdAt
                        ? new Date(l.time || l.timestamp || l.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const currentView = (() => {
    switch (view) {
      case "users":
        return (
          <ManageUsersSection showToast={showToast} showModal={() => {}} />
        );
      case "providers":
        return (
          <ProviderApprovalsSection
            showToast={showToast}
            showModal={() => {}}
          />
        );
      case "audit":
        return <AuditLogsSection showToast={showToast} />;
      case "notifications":
        return <NotificationsSection showToast={showToast} />;
      case "reports":
        return <ReportsSection showToast={showToast} />;
      case "vaccines":
        return <VaccinesSection showToast={showToast} />;
      case "settings":
        return (
          <SystemSettingsSection showToast={showToast} showModal={() => {}} />
        );
      case "overview":
      default:
        return overview;
    }
  })();

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-56px)]">
      <div className="flex">
        <AdminSidebar
          view={view}
          switchView={(id) => setView(id)}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={onLogout}
        />
        <main className="flex-1">{currentView}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
