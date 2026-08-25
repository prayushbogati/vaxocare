import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle,
  Eye,
  XCircle,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { api } from "../../apis";
import { Btn, Badge, cn } from "./UI";

const statusColor = { pending: "yellow", approved: "green", rejected: "red" };

const ProviderApprovalsSection = ({ showModal, showToast }) => {
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminProvidersPending();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setPendingProviders(list);
    } catch (e) {
      setError(e?.message || "Failed to load pending providers");
      showToast?.(e?.message || "Failed to load pending providers", "danger");
      setPendingProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalized = useMemo(
    () =>
      pendingProviders.map((p) => ({
        id: p._id || p.id,
        name: p.name || p.providerName || "Provider",
        type: p.type || p.clinicType || p.organizationType || "—",
        contact: p.contactPerson || p.contact || "—",
        email: p.email || "—",
        phone: p.phone || "—",
        location: p.location || p.city || "—",
        submitted:
          p.appliedAt || p.submittedAt || p.submitted || p.createdAt || "—",
        status: p.status || "pending",
        docs: p.docs || p.documents || [],
      })),
    [pendingProviders],
  );

  const counts = useMemo(() => {
    return {
      pending: normalized.filter((p) => p.status === "pending").length,
      approved: normalized.filter((p) => p.status === "approved").length,
      rejected: normalized.filter((p) => p.status === "rejected").length,
    };
  }, [normalized]);

  const shownProviders = useMemo(() => {
    if (filter === "pending")
      return normalized.filter((p) => p.status === "pending");
    if (filter === "all")
      return normalized.filter((p) => p.status === "pending");
    // Backend endpoint only returns pending providers currently.
    return [];
  }, [filter, normalized]);

  const approveProvider = async (provider) => {
    try {
      setLoading(true);
      await api.adminApproveProvider(provider.id);
      showToast?.(`${provider.name} approved!`, "success");
      setSelected(null);
      await load();
    } catch (e) {
      showToast?.(e?.message || "Failed to approve provider", "danger");
    } finally {
      setLoading(false);
    }
  };

  const rejectProvider = async (provider) => {
    try {
      setLoading(true);
      const reason = window.prompt(
        "Rejection reason (required)",
        "Incomplete documentation",
      );
      if (!reason) {
        showToast?.("Rejection cancelled (reason required).", "warning");
        return;
      }
      await api.adminRejectProvider(provider.id, { reason });
      showToast?.(`${provider.name} rejected!`, "success");
      setSelected(null);
      await load();
    } catch (e) {
      showToast?.(e?.message || "Failed to reject provider", "danger");
    } finally {
      setLoading(false);
    }
  };

  const formatSubmitted = (value) => {
    if (!value) return "—";
    if (typeof value === "string") return value;
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Provider Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve healthcare provider registrations.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          {
            label: "Pending Review",
            value: counts.pending,
            color: "bg-yellow-50 border-yellow-200 text-yellow-800",
          },
          {
            label: "Approved",
            value: counts.approved,
            color: "bg-green-50 border-green-200 text-green-800",
          },
          {
            label: "Rejected",
            value: counts.rejected,
            color: "bg-red-50 border-red-200 text-red-700",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={cn("rounded-xl border p-4 text-center", color)}
          >
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1 mb-5">
        {[
          ["all", "All"],
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
        ].map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setFilter(val)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer border-0",
              filter === val
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "gap-5",
          selected ? "grid grid-cols-1 lg:grid-cols-2" : "space-y-3",
        )}
      >
        {/* List */}
        <div className="space-y-3">
          {loading && shownProviders.length === 0 ? (
            <div className="bg-white rounded-xl border p-6 text-sm text-gray-500 text-center">
              Loading…
            </div>
          ) : shownProviders.length === 0 ? (
            <div className="bg-white rounded-xl border p-6 text-sm text-gray-500 text-center">
              No pending providers found.
            </div>
          ) : (
            shownProviders.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
                className={cn(
                  "bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm",
                  selected?.id === p.id
                    ? "border-blue-400 shadow-sm"
                    : "border-gray-200",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-purple-700" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-800">
                        {p.name}
                      </p>
                      <Badge color={statusColor[p.status] || "gray"}>
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.type} · {p.location}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">Submitted</p>
                    <p className="text-xs font-semibold text-gray-600">
                      {formatSubmitted(p.submitted)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Btn
                    variant="success"
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      approveProvider(p);
                    }}
                  >
                    <CheckCircle size={13} /> Approve
                  </Btn>

                  <Btn
                    variant="danger"
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      rejectProvider(p);
                    }}
                  >
                    <XCircle size={13} /> Reject
                  </Btn>

                  <Btn
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(p);
                    }}
                  >
                    <Eye size={13} /> Review
                  </Btn>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="bg-white rounded-xl border border-blue-200 overflow-hidden h-fit sticky top-20">
            <div className="bg-gradient-to-br from-blue-800 to-blue-600 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">
                    {selected.name}
                  </p>
                  <p className="text-blue-200 text-xs">{selected.type}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {[
                { icon: Mail, label: "Email", value: selected.email },
                { icon: Phone, label: "Phone", value: selected.phone },
                { icon: MapPin, label: "Location", value: selected.location },
                { icon: FileText, label: "Contact", value: selected.contact },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-blue-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {value || "—"}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Submitted Documents
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.docs || []).map((d) => (
                    <span
                      key={d}
                      className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <CheckCircle size={11} /> {d}
                    </span>
                  ))}
                  {(!selected.docs || selected.docs.length === 0) && (
                    <span className="text-xs text-gray-500">No documents.</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Btn
                  variant="success"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => approveProvider(selected)}
                >
                  <CheckCircle size={13} /> Approve
                </Btn>
                <Btn
                  variant="danger"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => rejectProvider(selected)}
                >
                  <XCircle size={13} /> Reject
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderApprovalsSection;
