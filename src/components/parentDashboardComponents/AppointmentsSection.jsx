import { useEffect, useMemo, useState } from "react";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";
import { api } from "../../apis/index.jsx";
import { Btn, Badge, cn } from "./UI";


const formatDayMonth = (dateStr) => {
  if (!dateStr) return { day: "—", month: "—" };
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return { day: "—", month: "—" };
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  return { day, month };
};

/**
 * Parent dashboard should show ONLY booked appointments.
 * Backend stores booking info on Vaccination records using:
 *  - scheduledDate
 *  - appointmentTime
 * and uses vaccination.status like:
 *  - pending (booked, not completed)
 *  - completed (given)
 *  - cancelled (cancelled after booking)
 */
const normalizeStatus = (v) => {
  const status = v?.status;

  const hasBookedContext = Boolean(v?.scheduledDate && v?.appointmentTime);

  if (!hasBookedContext) return null;

  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "pending" || status === "scheduled") return "upcoming";

  // Unknown statuses should not be treated as booked appointments.
  return null;
};

const AppointmentsSection = ({ showModal, showToast, refreshKey = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const openWithFirstChild = async () => {
    try {
      const childRes = await api.listChildren();
      const children = childRes?.data ?? childRes ?? [];
      const first = children?.[0]?._id || children?.[0]?.id;
      if (first) showModal("appt", { childId: first });
      else showToast?.("Please register/select a child first.", "danger");
    } catch (e) {
      showToast?.(e?.message || "Failed to open booking.", "danger");
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const childRes = await api.listChildren();
        const children = childRes?.data ?? childRes ?? [];
        const childIds = children.map((c) => c?._id || c?.id).filter(Boolean);

        const byChild = {};
        await Promise.all(
          childIds.map(async (id) => {
            const vRes = await api.getVaccinationsByChild(id);
            byChild[id] = vRes?.data ?? vRes ?? [];
          })
        );

        const childName = (cid) => {
          const c = children.find((x) => (x?._id || x?.id) === cid);
          return c?.name || c?.fullName || c?.firstName || "Child";
        };

        const derived = [];

        for (const cid of childIds) {
          const vaxList = byChild[cid] || [];
          for (const v of vaxList) {
            const normalized = normalizeStatus(v);
            if (!normalized) continue;

            const scheduledDate = v?.scheduledDate || null;
            const { day, month } = formatDayMonth(scheduledDate);

            // Since normalizeStatus already ensures booked context exists,
            // these fields should be present; keep defensive fallbacks.
            derived.push({
              vaccinationId: v?._id || v?.id,
              vaccination: v, // full record for report modal
              childId: v?.childId || cid,
              childLabel: childName(v?.childId || cid),
              vaccineName: v?.vaccineName || v?.vaccine || "Vaccine",
              day,
              month,
              time: v?.appointmentTime || "",
              clinic: "Kanti Children's Hospital", // backend currently doesn’t provide clinic
              status: normalized,
              statusLabel:
                normalized === "completed"
                  ? "Completed"
                  : normalized === "cancelled"
                    ? "Cancelled"
                    : v?.status === "pending"
                      ? "Pending"
                      : "Confirmed",
              badgeColor: normalized === "cancelled" ? "red" : normalized === "completed" ? "green" : "yellow",
              rawStatus: v?.status,
              scheduledDate,
            });
          }
        }

        if (mounted) setItems(derived);
      } catch (e) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshKey, showToast]);

  const shown = items;

  const handleCancel = async (vaccinationId) => {
    if (!vaccinationId) return;

    const ok = window.confirm("Are you sure you want to cancel this appointment?");
    if (!ok) return;

    // If user presses Cancel on the prompt, window.prompt returns null.
    const reasonPrompt = window.prompt("Cancellation reason (optional):");
    if (reasonPrompt === null) return;

    const reason = reasonPrompt || "";

    try {
      await api.cancelAppointment(vaccinationId, { reason });
      showToast?.("Appointment cancelled.", "success");
      setItems((prev) =>
        prev.map((x) =>
          x.vaccinationId === vaccinationId
            ? { ...x, status: "cancelled", rawStatus: "cancelled" }
            : x
        )
      );
    } catch (e) {
      showToast?.(e?.message || "Failed to cancel appointment.", "danger");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Book, view and manage vaccine appointments.</p>
        </div>
        <Btn variant="primary" onClick={openWithFirstChild}>
          <Plus size={16} /> Book New Appointment
        </Btn>
      </div>


      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {loading && (
            <div className="py-16 text-center text-gray-400 text-sm">Loading appointments…</div>
          )}

          {!loading && shown.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No booked appointments in this category</p>
            </div>
          )}

          {!loading &&
            shown.map((a) => (
              <div
                key={`${a.vaccinationId}-${a.childId}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors flex-wrap"
              >
                <div
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-center shrink-0 text-white",
                    a.status === "cancelled" ? "bg-red-500" : a.status === "completed" ? "bg-gray-500" : "bg-blue-800"
                  )}
                >
                  <div className="text-xl font-bold leading-none">{a.day}</div>
                  <div className="text-[10px] font-semibold opacity-80 mt-0.5">{a.month}</div>
                </div>

                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-bold text-gray-800">
                    {a.childLabel} – {a.vaccineName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {a.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {a.clinic}
                    </span>
                  </p>
                </div>

                <Badge color={a.badgeColor}>{a.statusLabel}</Badge>

                <div className="flex gap-2 shrink-0">
                  {a.status === "upcoming" && (
                    <>
                      <Btn variant="ghost" size="sm" onClick={() => handleCancel(a.vaccinationId)}>
                        Cancel
                      </Btn>
                    </>
                  )}

                  {a.status === "completed" && (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        showModal("vaccinationReport", {
                          vaccination: a.vaccination,
                          childLabel: a.childLabel,
                        })
                      }
                    >
                      View Report
                    </Btn>
                  )}

                  {a.status === "cancelled" && (
                    <Btn variant="primary" size="sm" onClick={() => showModal("appt", { childId: a.childId })}>
                      Rebook
                    </Btn>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsSection;
