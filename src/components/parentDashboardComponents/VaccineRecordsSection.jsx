import { useEffect, useMemo, useState } from "react";
import { Download, Check, Clock } from "lucide-react";
import { api } from "../../apis/index.jsx";
import { Btn, Badge, StatCard, cn } from "./UI";

const to24h = (timeStr) => {
  if (!timeStr) return "—";
  const s = String(timeStr).trim();

  // If already in HH:MM (24h)
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [hh, mm] = s.split(":");
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }

  // Parse "10:30 AM" / "10:30 PM"
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let hh = parseInt(m[1], 10);
    const mm = m[2];
    const ap = m[3].toUpperCase();
    if (ap === "PM" && hh !== 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }

  return s; // fallback
};

const nepaliTimeLabel = (timeStr) => {
  const t24 = to24h(timeStr);
  return t24 === "—" ? "—" : `${t24}`;
};

const formatVaccineDate = (dateStr) => {
  if (!dateStr) return "—";
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return String(dateStr);
  return dt.toLocaleDateString("en-US");
};

const statusMap = {
  completed: { color: "green", label: "✓ Done" },
  overdue: { color: "red", label: "⚠ Overdue" },
  due: { color: "yellow", label: "Due Soon" },
  scheduled: { color: "blue", label: "Scheduled" },
  pending: { color: "blue", label: "Pending" },
  upcoming: { color: "blue", label: "Upcoming" },
  cancelled: { color: "red", label: "Cancelled" },
};

const VaccineRecordsSection = ({ showModal, showToast }) => {
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState("");
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.listChildren();
        const list = res?.data ?? res ?? [];
        if (!mounted) return;
        setChildren(list);
        const firstId = list?.[0]?._id || list?.[0]?.id || "";
        setChildId((prev) => prev || firstId);
      } catch (e) {
        showToast?.(e?.message || "Failed to load children", "danger");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!childId) return;
      setLoading(true);
      try {
        const res = await api.getVaccinationsByChild(childId);
        const list = res?.data ?? res ?? [];
        if (!mounted) return;
        setVaccinations(list);
      } catch (e) {
        showToast?.(e?.message || "Failed to load vaccine records", "danger");
        if (!mounted) return;
        setVaccinations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [childId, showToast]);

  const summary = useMemo(() => {
    const done = vaccinations.filter((v) => v?.status === "completed").length;
    return { done, total: vaccinations.length };
  }, [vaccinations]);

  const activeChildLabel = useMemo(() => {
    const c = children.find((x) => (x?._id || x?.id) === childId);
    return (
      c?.name ||
      c?.fullName ||
      `${c?.firstName || ""} ${c?.lastName || ""}`.trim() ||
      "Child"
    );
  }, [children, childId]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vaccine Records</h1>
          <p className="text-sm text-gray-500 mt-1">Full vaccination history and upcoming schedule.</p>
        </div>
        <Btn
          variant="outline"
          onClick={() => showToast?.("Report downloaded!", "success")}
        >
          <Download size={16} /> Download Report
        </Btn>
      </div>

      <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1 mb-5">
        {children.map((c) => {
          const id = c?._id || c?.id;
          const label = c?.name || c?.fullName || `${c?.firstName || ""} ${c?.lastName || ""}`.trim() || "Child";
          return (
            <button
              key={id}
              onClick={() => setChildId(id)}
              className={cn(
                "px-5 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer border-0",
                childId === id ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <StatCard icon={Check} iconColor="green" value={summary.done} label="Vaccines Completed" />
        <StatCard icon={Clock} iconColor="yellow" value={Math.max(0, summary.total - summary.done)} label="Still Due" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">
            Vaccine Schedule
          </h3>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-gray-500">Loading records…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Vaccine", "Date", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vaccinations.map((v) => {
                  const s =
                    statusMap[v?.status] ||
                    statusMap[v?.status === "due" ? "due" : "upcoming"] ||
                    statusMap.upcoming;

                  const recordDateRaw = v?.dueDate || v?.scheduledDate || v?.date || null;
                  const recordDate = formatVaccineDate(recordDateRaw);
                  const recordTime = nepaliTimeLabel(v?.appointmentTime || v?.time);

                  const apptTimeRaw = v?.appointmentTime || v?.time || "";
                  const hasApptTime = Boolean(String(apptTimeRaw).trim());

                  const dateForInput = (() => {
                    const d = v?.scheduledDate || v?.dueDate || v?.date;
                    if (!d) return "";
                    const s = String(d);
                    return s.length >= 10 ? s.slice(0, 10) : s;
                  })();

                  const vaccinationId = v?._id || v?.id;

                  const action =
                    v?.status === "completed" ? (
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          showModal("vaccinationReport", {
                            vaccination: v,
                            childLabel: activeChildLabel,
                          })
                        }
                      >
                        View
                      </Btn>
                    ) : hasApptTime ? (
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          showModal("appt", {
                            childId,
                            mode: "reschedule",
                            initialChildId: childId,
                            initialVaccinationId: vaccinationId,
                            initialDate: dateForInput,
                            initialTime: apptTimeRaw,
                          })
                        }
                      >
                        Reschedule
                      </Btn>
                    ) : (v?.status === "overdue" || v?.status === "due") ? (
                      <Btn variant="primary" size="sm" onClick={() => showModal("appt", { childId })}>
                        Book
                      </Btn>
                    ) : (
                      <Btn variant="outline" size="sm" onClick={() => showModal("appt", { childId })}>
                        Schedule
                      </Btn>
                    );

                  return (
                    <tr key={v?._id || v?.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {v?.vaccineName || v?.vaccine || "Vaccine"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap">{recordDate || "—"}</span>
                          <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                            {nepaliTimeLabel(v?.appointmentTime || v?.time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={s.color}>{s.label}</Badge>
                      </td>
                      <td className="px-4 py-3">{action}</td>
                    </tr>
                  );
                })}
                {vaccinations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                      No vaccine records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccineRecordsSection;
