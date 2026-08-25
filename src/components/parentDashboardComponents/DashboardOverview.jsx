import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Check,
  Calendar,
  Clock,
  Activity,
  Plus,
  Syringe,
  Bell,
  User,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import { api } from "../../apis";
import { Btn, Badge, StatCard } from "./UI";

const DashboardOverview = ({ setView, showModal }) => {
  const [loading, setLoading] = useState(true);
  const [greetingName, setGreetingName] = useState("");
  const [children, setChildren] = useState([]);
  const [vaccinationsByChild, setVaccinationsByChild] = useState({});

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);

      try {
        const meRes = await api.me();
        const me = meRes?.data ?? meRes;

        const name =
          me?.name ||
          me?.fullName ||
          [me?.firstName, me?.lastName].filter(Boolean).join(" ");

        if (mounted) setGreetingName(name || "");
      } catch {
        if (mounted) setGreetingName("");
      }

      try {
        const childRes = await api.listChildren();
        const childList = childRes?.data ?? childRes ?? [];

        if (!mounted) return;

        setChildren(childList);

        const map = {};
        await Promise.all(
          (childList || []).map(async (c) => {
            const id = c?._id || c?.id;
            if (!id) return;

            const vRes = await api.getVaccinationsByChild(id);
            map[id] = vRes?.data ?? vRes ?? [];
          })
        );

        if (mounted) setVaccinationsByChild(map);
      } catch {
        if (mounted) setChildren([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const derived = useMemo(() => {
    const parseDate = (d) => {
      if (!d) return null;
      const x = new Date(d);
      return Number.isNaN(x.getTime()) ? null : x;
    };

    const childNameById = (childId) => {
      const child = children.find((c) => (c?._id || c?.id) === childId);
      return child?.name || child?.fullName || child?.firstName || "Child";
    };

    const childIds = children.map((c) => c?._id || c?.id).filter(Boolean);
    const allVaccinations = childIds.flatMap((id) => vaccinationsByChild[id] || []);

    const vaccinesGiven = allVaccinations.filter((v) => v?.status === "completed").length;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const inCurrentMonth = (d) => {
      const x = parseDate(d);
      if (!x) return false;
      return x >= currentMonthStart && x < nextMonthStart;
    };

    const dueThisMonth = allVaccinations.filter(
      (v) => (v?.status === "overdue" || v?.status === "pending") && inCurrentMonth(v?.dueDate)
    );

    const upcomingAppointments = [...allVaccinations]
      .filter((v) => v?.scheduledDate || v?.appointmentTime)
      .filter((v) => v?.status === "pending" || v?.status === "overdue")
      .sort((a, b) => {
        const da = a?.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        const db = b?.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
        return da - db;
      });

    const upcomingList = upcomingAppointments.slice(0, 2).map((v) => {
      const sd = v?.scheduledDate ? new Date(v.scheduledDate) : null;
      const day = sd ? String(sd.getDate()).padStart(2, "0") : "—";
      const month = sd ? sd.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "—";

      const approval = v?.approvalStatus;
      const statusLabel = approval === "approved" ? "Confirmed" : "Pending";
      const badgeColor = approval === "approved" ? "green" : "yellow";

      return {
        key: `${v?._id || v?.id || v?.vaccineName}-${v?.scheduledDate || v?.appointmentTime}`,
        day,
        month,
        name: `${childNameById(v?.childId)} – ${v?.vaccineName || "Vaccine"}`,
        time: `${v?.appointmentTime ? v.appointmentTime : "Time not set"}`,
        badgeColor,
        statusLabel,
      };
    });

    const dueSoonWindowDays = 14;
    const dueSoonLimitMs = now.getTime() + dueSoonWindowDays * 24 * 60 * 60 * 1000;

    const dueSoonCandidates = allVaccinations
      .filter((v) => v?.dueDate)
      .sort((a, b) => (parseDate(a.dueDate)?.getTime() ?? 0) - (parseDate(b.dueDate)?.getTime() ?? 0))
      .filter((v) => {
        const d = parseDate(v.dueDate);
        return d ? d.getTime() <= dueSoonLimitMs : false;
      });

    const dueSoonList = dueSoonCandidates.slice(0, 3).map((v) => {
      const due = parseDate(v.dueDate);
      const nowMs = now.getTime();

      const isOverdue = v?.status === "overdue" || (due ? due.getTime() < nowMs : false);
      const isDueSoon = !isOverdue && due ? due.getTime() <= dueSoonLimitMs : !isOverdue;

      const dot = isOverdue ? "bg-red-500" : isDueSoon ? "bg-yellow-500" : "bg-blue-400";
      const badgeColor = isOverdue ? "red" : isDueSoon ? "yellow" : "blue";
      const label = isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Upcoming";

      const date = due
        ? `${isOverdue ? "Was due" : "Due"}: ${due.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`
        : "";

      return {
        key: `${v?._id || v?.id || v?.vaccineName}-${v?.dueDate}`,
        dot,
        name: `${childNameById(v?.childId)} – ${v?.vaccineName || "Vaccine"}`,
        date,
        badgeColor,
        label,
      };
    });

    return {
      greetingName,
      childrenCount: children.length,
      vaccinesGiven,
      upcomingAppointmentsCount: upcomingAppointments.length,
      dueThisMonthCount: dueThisMonth.length,
      upcomingList,
      dueSoonList,
    };
  }, [children, vaccinationsByChild, greetingName]);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Good morning, {derived.greetingName || "there"} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your children's vaccination schedule.</p>
      </div>
{/* 
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3.5 flex items-start gap-2.5 mb-6 text-sm text-yellow-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-yellow-600" />
        <span>
          <strong>Upcoming:</strong>{" "}
          {derived.dueSoonList?.[0]?.name ? (
            <>
              {derived.dueSoonList[0].name} —{" "}
              <button
                onClick={() => showModal("appt")}
                className="underline text-blue-700 font-medium"
              >
                book an appointment
              </button>
            </>
          ) : (
            <>No upcoming vaccines found.</>
          )}
        </span>
      </div> */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          iconColor="blue"
          value={derived.childrenCount}
          label="Registered Children"
          sub="Your kids"
        />
        <StatCard
          icon={Check}
          iconColor="green"
          value={derived.vaccinesGiven}
          label="Vaccines Given"
          sub="Completed vaccinations"
        />
        <StatCard
          icon={Calendar}
          iconColor="yellow"
          value={derived.upcomingAppointmentsCount}
          label="Upcoming Appointments"
          sub="Based on scheduled vaccinations"
        />
        <StatCard
          icon={Clock}
          iconColor="orange"
          value={derived.dueThisMonthCount}
          label="Due This Month"
          sub="Overdue + pending in current month"
        />
      </div>

      <p className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
        <Activity size={16} className="text-blue-600" /> Quick Actions
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {[
          { icon: Plus, label: "Register Child", action: () => showModal("register") },
          { icon: Calendar, label: "Book Appointment", action: () => showModal("appt") },
          { icon: Syringe, label: "View Records", action: () => setView("vaccines") },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 bg-blue-800 group-hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
              <Icon size={18} className="text-white" />
            </div>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Upcoming Appointments</h3>
            <Btn variant="outline" size="sm" onClick={() => setView("appointments")}>
              View all
            </Btn>
          </div>

          <div className="p-4 space-y-3">
            {derived.upcomingList.length === 0 ? (
              <div className="py-6 text-center text-gray-400">No upcoming appointments</div>
            ) : (
              derived.upcomingList.map(({ key, day, month, name, time, badgeColor, statusLabel }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors"
                >
                  <div className="rounded-lg px-3 py-2 text-center shrink-0 text-white bg-blue-800">
                    <div className="text-lg font-bold leading-none">{day}</div>
                    <div className="text-[10px] font-semibold text-blue-200 mt-0.5">{month}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {time}
                    </p>
                  </div>

                  <Badge color={badgeColor}>{statusLabel}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Vaccine Due Soon</h3>
            <Btn variant="outline" size="sm" onClick={() => setView("vaccines")}>
              Full schedule
            </Btn>
          </div>

          <div className="p-4 space-y-3">
            {derived.dueSoonList.length === 0 ? (
              <div className="py-6 text-center text-gray-400">No due vaccines soon</div>
            ) : (
              derived.dueSoonList.map(({ key, dot, name, date, badgeColor, label }) => (
                <div key={key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-1.5 gap-1">
                    <div className={`w-3 h-3 rounded-full shrink-0 border-2 border-white shadow-sm ${dot}`} />
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{date}</p>
                    <Badge color={badgeColor}>{label}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
