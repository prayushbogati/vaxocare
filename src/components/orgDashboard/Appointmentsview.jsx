import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Check, X, RefreshCw } from "lucide-react";
import { Btn, Badge, cn } from "./Shared";
import { api } from "../../apis";

const formatTime = (t) => {
  if (!t) return "—";
  return String(t);
};

/* Provider dashboard: booked/queued vaccination appointments (provider-scoped) */
const AppointmentsView = ({ showModal, showToast }) => {
  const [filter, setFilter] = useState("pending"); // pending | approved | rejected | all
  const [loading, setLoading] = useState(true);
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const res = await api.providerTodayAppointments();
        const list = res?.data ?? res ?? [];
        if (!mounted) return;
        setAppts(Array.isArray(list) ? list : []);
      } catch {
        if (!mounted) return;
        setAppts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const normalized = useMemo(() => {
    return (appts || []).map((a) => {
      const approvalStatus = a?.approvalStatus || "pending";
      const status = a?.status || "pending";

      // providerController populates childId -> parentId
      const childName = a?.childId?.name || a?.childId?.fullName || "Child";
      const parentName = a?.childId?.parentId?.name || a?.childId?.parentId?.fullName || "—";

      const displayStatus =
        status === "completed"
          ? "completed"
          : status === "cancelled"
            ? "cancelled"
            : approvalStatus === "approved"
              ? "approved"
              : approvalStatus === "rejected"
                ? "rejected"
                : "pending";

      return {
        id: a?._id || a?.id,
        childName,
        parentName,
        vaccineName: a?.vaccineName || a?.name || "Vaccination",
        time: a?.appointmentTime || a?.scheduledDate || a?.time || "—",
        clinic: a?.clinic || a?.location || "—",
        approvalStatus,
        status,
        displayStatus,
      };
    });
  }, [appts]);

  const shown = useMemo(() => {
    if (filter === "all") return normalized;
    return normalized.filter((a) => a.displayStatus === filter);
  }, [normalized, filter]);

  const handleApprove = async (id) => {
    try {
      await api.providerApproveAppointment(id);
      setAppts((prev) =>
        prev.map((item) =>
          (item?._id || item?.id) === id
            ? { ...item, approvalStatus: "approved" }
            : item
        )
      );
      showToast?.("Appointment approved.", "success");
    } catch (e) {
      showToast?.(e?.message || "Failed to approve appointment", "danger");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return;

    try {
      await api.providerRejectAppointment(id, { reason });
      setAppts((prev) =>
        prev.map((item) =>
          (item?._id || item?.id) === id
            ? { ...item, approvalStatus: "rejected" }
            : item
        )
      );
      showToast?.("Appointment rejected.", "success");
    } catch (e) {
      showToast?.(e?.message || "Failed to reject appointment", "danger");
    }
  };

  const handleReschedule = async (id) => {
    const newDate = window.prompt("Enter new date (YYYY-MM-DD):");
    if (!newDate) return;
    const newTime = window.prompt("Enter new time (e.g. 10:30 AM):");
    if (!newTime) return;

    try {
      await api.providerRescheduleAppointment(id, { newDate, newTime });
      setAppts((prev) =>
        prev.map((item) =>
          (item?._id || item?.id) === id
            ? { ...item, appointmentTime: newTime, scheduledDate: newDate }
            : item
        )
      );
      showToast?.("Appointment rescheduled.", "success");
    } catch (e) {
      showToast?.(e?.message || "Failed to reschedule appointment", "danger");
    }
  };

  const tabs = [
    ["pending", "Pending"],
    ["approved", "Approved"],
    ["rejected", "Rejected"],
    ["all", "All"],
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointment Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve, reject, or reschedule vaccination appointments booked by parents.
        </p>
      </div>

      <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1 mb-5">
        {tabs.map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer border-0",
              filter === val
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {loading && (
            <div className="py-16 text-center text-gray-500">
              Loading appointments…
            </div>
          )}

          {!loading && shown.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No appointments in this category</p>
            </div>
          )}

          {!loading &&
            shown.map(({ id, childName, parentName, vaccineName, time, clinic, displayStatus, status }) => (
              <div
                key={id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors flex-wrap"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold",
                    displayStatus === "rejected"
                      ? "bg-red-500"
                      : displayStatus === "approved"
                        ? "bg-gray-500"
                        : "bg-emerald-700"
                  )}
                >
                  {String(childName)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div className="flex-1 min-w-50">
                  <p className="text-sm font-bold text-gray-800">
                    {childName} — {vaccineName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span>Guardian: {parentName}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatTime(time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {clinic}
                    </span>
                  </p>
                </div>

                <Badge color={displayStatus === "pending" ? "yellow" : displayStatus === "approved" ? "green" : "red"}>
                  {displayStatus === "pending" ? "Pending" : displayStatus === "approved" ? "Approved" : "Rejected"}
                </Badge>

                <div className="flex gap-2 shrink-0">
                  {displayStatus === "pending" && (
                    <>
                      <Btn
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(id)}
                      >
                        <Check size={13} /> Approve
                      </Btn>
                      <Btn
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(id)}
                      >
                        <X size={13} /> Reject
                      </Btn>
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() => handleReschedule(id)}
                      >
                        <RefreshCw size={13} /> Reschedule
                      </Btn>
                    </>
                  )}

                  {displayStatus === "approved" && (
                    <Btn variant="primary" size="sm" onClick={() => showModal?.("complete")}>
                      Mark Complete
                    </Btn>
                  )}

                  {displayStatus === "rejected" && <Btn variant="ghost" size="sm">View Reason</Btn>}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsView;
