import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Calendar,
  Syringe,
  Clock,
  AlertTriangle,
  Check,
  ShieldCheck,
  ClipboardList,
  Bell,
} from "lucide-react";
import { Btn, StatCard } from "./Shared";
import { api } from "../../apis";

/* Provider dashboard overview.
   - Provider identity comes from DB via api.me()
   - Counts/lists removed or replaced with loading states (no hardcoded data) */
const OrgDashboardView = ({ setView, showModal }) => {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoadingMe(true);
      try {
        const res = await api.me();
        if (!mounted) return;
        setMe(res?.data ?? res ?? null);
      } catch {
        if (!mounted) return;
        setMe(null);
      } finally {
        if (mounted) setLoadingMe(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const providerName = useMemo(() => {
    const n = me?.name;
    if (!n) return "Provider";
    return n;
  }, [me]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Good morning, {loadingMe ? "…" : providerName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here’s what needs your attention today.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 mb-6 text-sm text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <span>
          <strong>— appointment requests</strong> are waiting for approval —{" "}
          <button
            onClick={() => setView("appointments")}
            className="underline text-emerald-700 font-medium"
          >
            review requests
          </button>
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          iconColor="blue"
          value="—"
          label="Assigned Children"
          sub="Loading from database"
        />
        <StatCard
          icon={Clock}
          iconColor="yellow"
          value="—"
          label="Pending Approvals"
          sub="Loading from database"
        />
        <StatCard
          icon={Syringe}
          iconColor="green"
          value="—"
          label="Vaccinations Today"
          sub="Loading from database"
        />
        <StatCard
          icon={AlertTriangle}
          iconColor="red"
          value="—"
          label="Overdue Vaccines"
          sub="Loading from database"
        />
      </div>

      <p className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
        <ClipboardList size={16} className="text-emerald-600" /> Quick Actions
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {[
          { icon: Check, label: "Approve Appts", action: () => setView("appointments") },
          { icon: Calendar, label: "Reschedule", action: () => setView("appointments") },
          { icon: Syringe, label: "Complete Vaccine", action: () => showModal("complete") },
          { icon: ShieldCheck, label: "Manual Override", action: () => showModal("override") },
          { icon: Users, label: "Assigned Children", action: () => setView("children") },
          { icon: Bell, label: "Send Reminder", action: () => showModal("reminder") },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2 text-xs font-semibold text-gray-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 bg-emerald-800 group-hover:bg-emerald-700 rounded-lg flex items-center justify-center transition-colors">
              <Icon size={18} className="text-white" />
            </div>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Pending Approval Requests</h3>
            <Btn variant="outline" size="sm" onClick={() => setView("appointments")}>
              View all
            </Btn>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-sm text-gray-500">Loading pending requests from database…</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Overdue / Upcoming</h3>
            <Btn variant="outline" size="sm" onClick={() => setView("overdue")}>
              Full list
            </Btn>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-sm text-gray-500">Loading overdue/upcoming worklist from database…</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboardView;
