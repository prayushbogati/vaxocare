import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Calendar } from "lucide-react";
import { Btn, ProgressBar, cn } from "./UI";
import { api } from "../../apis";

const gradientByIndex = (i) => {
  // keep it deterministic but varied
  const options = [
    "from-blue-800 to-blue-600",
    "from-blue-900 to-blue-700",
    "from-indigo-800 to-indigo-600",
    "from-sky-800 to-sky-600",
  ];
  return options[i % options.length];
};

const initialFromName = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "C";
  const first = parts[0]?.[0] || "C";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const ChildrenSection = ({ showModal, refreshKey = 0 }) => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [vaccinationsByChild, setVaccinationsByChild] = useState({});

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const childRes = await api.listChildren();
        const childList = childRes?.data ?? childRes ?? [];
        if (!mounted) return;

        setChildren(childList);

        const map = {};
        await Promise.all(
          (childList || []).map(async (c, idx) => {
            const id = c?._id || c?.id;
            if (!id) return;
            const vRes = await api.getVaccinationsByChild(id);
            map[id] = vRes?.data ?? vRes ?? [];
          })
        );
        if (mounted) setVaccinationsByChild(map);
      } catch {
        if (mounted) {
          setChildren([]);
          setVaccinationsByChild({});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const cards = useMemo(() => {
    return (children || []).map((c, idx) => {
      const id = c?._id || c?.id;
      const name =
        c?.name ||
        c?.fullName ||
        [c?.firstName, c?.lastName].filter(Boolean).join(" ") ||
        "Child";
      const initial = initialFromName(name);

      const dob = c?.dateOfBirth || c?.dob || c?.birthDate;
      const gender = c?.gender || c?.sex;
      const region = c?.region ?? "Unknown";
      const assignedProviderId = c?.assignedProviderId ? String(c.assignedProviderId) : "—";
      const bloodGroup = c?.bloodGroup ?? c?.bloodType ?? c?.blood ?? "";
      const allergies = c?.allergies ?? "";
      const riskScore = typeof c?.riskScore === "number" ? c.riskScore : 0;
      const isActive = typeof c?.isActive === "boolean" ? c.isActive : true;
      const lastCorrectionDate = c?.lastCorrectionDate ? String(c.lastCorrectionDate) : "";
      const correctionApprovedBy = c?.correctionApprovedBy ? String(c.correctionApprovedBy) : "—";

      const dobLabel = dob
        ? new Date(dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "—";
      const createdAt = c?.createdAt ? String(c.createdAt) : "";
      const updatedAt = c?.updatedAt ? String(c.updatedAt) : "";

      const vaccinations = vaccinationsByChild?.[id] || [];

      // Backend may return different status aliases depending on schedule/booking flow.
      const isCompleted = (v) => {
        const s = (v?.status || "").toString().toLowerCase();
        return s === "completed" || s === "done" || s === "given";
      };

      const done = vaccinations.filter((v) => isCompleted(v)).length;
      const total = vaccinations.length || 0;
      const pct = total ? Math.round((done / total) * 100) : 0;

      const ageLine = `${dob ? `DOB: ${dobLabel}` : "Profile details"}${gender ? ` · ${gender}` : ""}`;

      const lastCorrectionLabel = lastCorrectionDate
        ? new Date(lastCorrectionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "—";

      const createdAtLabel = createdAt
        ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "—";

      const updatedAtLabel = updatedAt
        ? new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "—";

      return {
        idx,
        id,
        key: id,
        initial,
        name,
        dobLabel,
        ageLine,
        gender: gender || "—",
        region: region || "Unknown",
        assignedProviderId,
        bloodGroup: bloodGroup || "—",
        allergies: allergies || "—",
        riskScore,
        isActive,
        lastCorrectionLabel,
        correctionApprovedBy,
        createdAtLabel,
        updatedAtLabel,
        done,
        total,
        pct,
      };
    });
  }, [children, vaccinationsByChild]);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">Loading children…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Children</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your children's profiles and vaccination details.</p>
        </div>
        <Btn variant="primary" onClick={() => showModal("register")}>
          <Plus size={16} /> Register New Child
        </Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.key} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all">
            <div className={cn("bg-gradient-to-br p-5 flex items-center gap-3", gradientByIndex(card.idx))}>
              <div className="w-12 h-12 rounded-full bg-white/25 border-2 border-white/50 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {card.initial}
              </div>
              <div>
                <p className="text-white font-bold text-base">{card.name}</p>
                <p className="text-blue-200 text-xs mt-0.5">{card.ageLine}</p>
              </div>
            </div>

            <div className="p-4 space-y-2.5">
              {[["Date of Birth", card.dobLabel], ["Blood Type", card.bloodGroup], ["Allergies", card.allergies]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-700">{v}</span>
                </div>
              ))}

              <div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">Vaccination progress</span>
                  <span className="text-blue-700 font-bold">
                    {card.total ? `${card.done}/${card.total}` : "—"}
                  </span>
                </div>
                <ProgressBar pct={card.pct} />
              </div>
            </div>

            <div className="px-4 pb-4 flex gap-2">
              <Btn
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => showModal("editChild", { childId: card.id })}
              >
                <Edit2 size={13} /> Edit Profile
              </Btn>
              <Btn variant="primary" size="sm" className="flex-1" onClick={() => showModal("appt", { childId: card.id })}>
                <Calendar size={13} /> Book Appt
              </Btn>
            </div>
          </div>
        ))}

        <button
          onClick={() => showModal("register")}
          className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl min-h-[260px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
            <Plus size={22} />
          </div>
          <span className="text-sm font-semibold">Register New Child</span>
          <span className="text-xs">Add another child profile</span>
        </button>
      </div>
    </div>
  );
};

export default ChildrenSection;
