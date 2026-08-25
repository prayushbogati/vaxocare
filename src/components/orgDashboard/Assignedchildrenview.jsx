import { useEffect, useMemo, useState } from "react";
import { Search, Syringe } from "lucide-react";
import { Btn, ProgressBar, Input } from "./Shared";
import { api } from "../../apis";

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

const AssignedChildrenView = ({ showModal }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);

  const [vaccinationsByChild, setVaccinationsByChild] = useState({});

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        // Provider portal should only show provider-assigned children
        const res = await api.providerChildren();
        const list = res?.data ?? res ?? [];
        if (!mounted) return;

        setChildren(Array.isArray(list) ? list : []);

        // Provider-scoped vaccination records per child
        const map = {};
        await Promise.all(
          (list || []).map(async (c) => {
            const id = c?._id || c?.id;
            if (!id) return;

            const vRes = await api.providerChildVaccinations(id);
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
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return children;

    return (children || []).filter((c) => {
      const name = c?.name || c?.fullName || "";
      const parentId = c?.parentId ? String(c.parentId) : "";
      return name.toLowerCase().includes(q) || parentId.toLowerCase().includes(q);
    });
  }, [children, query]);

  const cards = useMemo(() => {
    return (filtered || []).map((c) => {
      const id = c?._id || c?.id;
      const name = c?.name || c?.fullName || "Child";
      const initial = initialFromName(name);

      const dob = c?.dateOfBirth || c?.dob || c?.birthDate;
      const gender = c?.gender || c?.sex || "—";

      const vaccinations = vaccinationsByChild?.[id] || [];
      const done = vaccinations.filter((v) => v?.status === "completed").length;
      const total = vaccinations.length || 0;
      const pct = total ? Math.round((done / total) * 100) : 0;

      return {
        id,
        initial,
        name,
        dob,
        gender,

        // backend model fields
        region: c?.region ?? "Unknown",
        assignedProviderId: c?.assignedProviderId ? String(c.assignedProviderId) : "—",
        bloodGroup: c?.bloodGroup ?? c?.bloodType ?? c?.blood ?? "—",
        allergies: c?.allergies ?? "—",
        riskScore: typeof c?.riskScore === "number" ? c.riskScore : 0,
        isActive: typeof c?.isActive === "boolean" ? c.isActive : true,
        lastCorrectionDate: c?.lastCorrectionDate ? String(c.lastCorrectionDate) : "",
        correctionApprovedBy: c?.correctionApprovedBy ? String(c.correctionApprovedBy) : "—",

        createdAt: c?.createdAt ? String(c.createdAt) : "",
        updatedAt: c?.updatedAt ? String(c.updatedAt) : "",

        done,
        total,
        pct,
      };
    });
  }, [filtered, vaccinationsByChild]);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Assigned Children</h1>
          <p className="text-sm text-gray-500 mt-1">Loading children…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assigned Children</h1>
          <p className="text-sm text-gray-500 mt-1">Manage child profiles and vaccination details.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by child name or parentId…" className="pl-9 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all">
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 p-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/25 border-2 border-white/50 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {card.initial}
              </div>
              <div>
                <p className="text-white font-bold text-base">{card.name}</p>
                <p className="text-emerald-200 text-xs mt-0.5">
                  {card.dob ? `DOB: ${new Date(card.dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "DOB —"} · {card.gender}
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Vaccination progress</span>
                  <span className="text-emerald-700 font-bold">{card.total ? `${card.done}/${card.total}` : "—"}</span>
                </div>
                <ProgressBar pct={card.pct} />
              </div>

              <div className="space-y-1.5 text-sm text-gray-700">
                {[
                  ["Region", card.region],
                  ["Assigned Provider ID", card.assignedProviderId],
                  ["Blood Group", card.bloodGroup],
                  ["Allergies", card.allergies],
                  ["Risk Score", String(card.riskScore)],
                  ["Active", String(card.isActive)],
                  ["Last Correction Date", card.lastCorrectionDate ? new Date(card.lastCorrectionDate).toLocaleDateString("en-US") : "—"],
                  ["Correction Approved By", card.correctionApprovedBy],
                  ["Created At", card.createdAt ? new Date(card.createdAt).toLocaleDateString("en-US") : "—"],
                  ["Updated At", card.updatedAt ? new Date(card.updatedAt).toLocaleDateString("en-US") : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-800 text-right break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 flex gap-2">
              <Btn variant="outline" size="sm" className="flex-1" onClick={() => showModal("editChild", { childId: card.id })}>
                Edit Profile
              </Btn>
              <Btn variant="ghost" size="sm" className="flex-1" onClick={() => showModal("registerChild")}>
                Register
              </Btn>
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400">
            <Search size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No children match "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedChildrenView;
