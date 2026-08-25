import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import { api } from "../../apis/index.jsx";
import { Btn, Select, FormGroup } from "./UI";

const SettingsSection = ({ showToast }) => {
  const [exporting, setExporting] = useState(false);

  const [providersLoading, setProvidersLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");

  const handleExportAllData = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const childRes = await api.listChildren();
      const children = childRes?.data ?? childRes ?? [];

      const safeChildren = Array.isArray(children) ? children : [];
      if (safeChildren.length === 0) {
        showToast?.("No children found to export.", "warning");
        return;
      }

      // Parent-facing abstract export only.
      const statusMap = {
        completed: { label: "✓ Done", color: "green" },
        overdue: { label: "⚠ Overdue", color: "red" },
        due: { label: "Due Soon", color: "yellow" },
        scheduled: { label: "Scheduled", color: "blue" },
        pending: { label: "Pending", color: "blue" },
        upcoming: { label: "Upcoming", color: "blue" },
        cancelled: { label: "Cancelled", color: "red" },
      };

      const getChildLabel = (c) =>
        c?.name ||
        c?.fullName ||
        `${c?.firstName || ""} ${c?.lastName || ""}`.trim() ||
        "Child";

      const formatDateTime24 = (value) => {
        if (!value) return "—";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");

        // If time is exactly midnight (or date-only), show only date.
        if (hh === "00" && mm === "00") return `${y}-${m}-${day}`;
        return `${y}-${m}-${day} ${hh}:${mm}`;
      };

      const getVaccineRecordDate = (v) => {
        return formatDateTime24(v?.dueDate || v?.scheduledDate || v?.date);
      };

      const statusForPdf = (v) => {
        const rec =
          statusMap[v?.status] ||
          statusMap[v?.status === "due" ? "due" : "upcoming"] ||
          statusMap.upcoming ||
          { label: "—", color: "gray" };
        return rec?.label ? rec : { label: "—", color: "gray" };
      };

      showToast?.("Preparing PDF…", "info");

      const childBlocks = [];
      for (const c of safeChildren) {
        const id = c?._id || c?.id;
        if (!id) continue;

        const vRes = await api.getVaccinationsByChild(id);
        const vacList = vRes?.data ?? vRes ?? [];

        const rows = (Array.isArray(vacList) ? vacList : [])
          .map((v) => {
            const rec = statusForPdf(v);
            return {
              vaccine: v?.vaccineName || v?.vaccine || "Vaccine",
              date: getVaccineRecordDate(v),
              status: rec?.label || "—",
            };
          })
          .filter((r) => r.vaccine || r.date || r.status);

        childBlocks.push({
          childLabel: getChildLabel(c),
          rows,
        });
      }

      if (childBlocks.length === 0) {
        showToast?.("No vaccine records found to export.", "warning");
        return;
      }

      const now = new Date();
      const title = "Vaccine Records Report";
      const generatedAt = formatDateTime24(now);

      const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #111; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    .meta { font-size: 12px; color: #444; margin-bottom: 18px; }
    .child { margin-top: 18px; page-break-inside: avoid; }
    .child h2 { font-size: 14px; margin: 0 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    th, td { border: 1px solid #ddd; padding: 8px 6px; font-size: 12px; vertical-align: top; }
    th { background: #f5f5f5; text-align: left; }
    .footer { font-size: 11px; color: #666; margin-top: 20px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Generated: ${generatedAt}</div>

  ${childBlocks
          .map((b) => {
            const rowsHtml = (b.rows || [])
              .map(
                (r) => `
        <tr>
          <td>${String(r.vaccine).replace(/</g, "<")}</td>
          <td>${String(r.date).replace(/</g, "<")}</td>
          <td>${String(r.status).replace(/</g, "<")}</td>
        </tr>
      `
              )
              .join("");

            return `
        <div class="child">
          <h2>${String(b.childLabel).replace(/</g, "<")}</h2>
          <table>
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `
                <tr>
                  <td colspan="3" style="color:#666;">No vaccine records found.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      `;
          })
          .join("")}

  <div class="footer">This export contains parent-facing abstract information only (no internal IDs).</div>

  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>
      `.trim();

      // iframe print to avoid pop-up blockers
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        showToast?.("Failed to initialize print view.", "danger");
        return;
      }

      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          document.body.removeChild(iframe);
        }
      }, 250);

      showToast?.("PDF ready. Use the print dialog to save as PDF.", "success");
    } catch (e) {
      showToast?.(e?.message || "Failed to export data.", "danger");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadProvidersAndSelection = async () => {
      try {
        setProvidersLoading(true);

        const [listRes, selRes] = await Promise.all([
          api.listProvidersForParent(),
          api.getSelectedProvider(),
        ]);

        const list = listRes?.data ?? listRes ?? [];
        const selId = selRes?.providerId || "";

        if (!mounted) return;

        setProviders(Array.isArray(list) ? list : []);
        setSelectedProviderId(selId || "");
      } catch (e) {
        if (!mounted) return;
        setProviders([]);
        setSelectedProviderId("");
        showToast?.(e?.message || "Failed to load providers", "danger");
      } finally {
        if (mounted) setProvidersLoading(false);
      }
    };

    loadProvidersAndSelection();
    return () => {
      mounted = false;
    };
    // Intentionally empty dependency array to avoid infinite render loops.
    // showToast is optional and does not need to re-trigger provider loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const providerOptions = useMemo(() => {
    return (providers || []).map((p) => {
      const id = p?._id || p?.id;
      const label =
        p?.username ||
        p?.email ||
        p?.name ||
        p?.fullName ||
        "Provider";
      return { id, label };
    });
  }, [providers]);

  const selectedProviderLabel = useMemo(() => {
    const p = providers.find((x) => (x?._id || x?.id) === selectedProviderId);
    return p?.username || p?.email || p?.name || p?.fullName || "—";
  }, [providers, selectedProviderId]);

  const handleSaveProvider = async () => {
    try {
      if (!selectedProviderId) {
        showToast?.("Please select a provider.", "warning");
        return;
      }
      await api.setSelectedProvider(selectedProviderId);
      showToast?.(`Provider selected: ${selectedProviderLabel}`, "success");
    } catch (e) {
      showToast?.(e?.message || "Failed to save provider selection", "danger");
    }
  };

  const handleDeleteAccount = async () => {
    const ok1 = window.confirm(
      "WARNING: This will permanently delete your account and cannot be undone.\n\nClick OK to proceed."
    );
    if (!ok1) return;

    const ok2 = window.confirm(
      "Final confirmation: Are you absolutely sure you want to permanently delete the account?"
    );
    if (!ok2) return;

    // NOTE: Frontend currently has no dedicated delete-account endpoint in api client.
    showToast?.("Account deletion is not available right now (missing backend endpoint).", "danger");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your app preferences and account options.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Preferred Clinic</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Default Clinic">
              <Select defaultValue={"Kanti Children's Hospital"}>
                <option>Kanti Children's Hospital</option>
                <option>Patan Hospital</option>
                <option>Bir Hospital</option>
                <option>Teaching Hospital, TU</option>
              </Select>
            </FormGroup>

            <FormGroup label="Preferred Appointment Time">
              <Select>
                <option>Morning (8AM–12PM)</option>
                <option>Afternoon (12PM–4PM)</option>
                <option>Evening (4PM–7PM)</option>
              </Select>
            </FormGroup>
          </div>

          <div className="mt-4">
            <Btn variant="primary" onClick={() => showToast?.("Settings saved!", "success")}>
              Save Settings
            </Btn>
          </div>
        </div>
      </div>

      {/* Provider block (parent scope) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Provider</h3>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <FormGroup label="Provider" full>
              <Select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                disabled={providersLoading}
              >
                <option value="">{providersLoading ? "Loading…" : "Select provider"}</option>
                {providerOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <Btn variant="primary" onClick={handleSaveProvider} disabled={providersLoading}>
              Save Provider
            </Btn>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Current selection:{" "}
            <span className="font-semibold text-gray-700">{selectedProviderLabel}</span>
          </div>

          {!providersLoading && (
            <div className="mt-2 text-xs text-gray-500">
              Providers loaded: <span className="font-semibold">{(providers || []).length}</span>
            </div>
          )}

          {!providersLoading && (providers || []).length === 0 && (
            <div className="mt-2 text-sm text-gray-500">
              No providers found for this parent. If providers exist, check backend parentId linkage.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Danger Zone</h3>
        </div>
        <div className="p-5">
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700 mb-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            These actions are permanent and cannot be undone.
          </div>

          <div className="flex gap-3 flex-wrap">
            <Btn variant="ghost" onClick={handleExportAllData} disabled={exporting}>
              <Download size={15} /> {exporting ? "Exporting..." : "Export All Data"}
            </Btn>

            <Btn variant="danger" onClick={handleDeleteAccount}>
              <Trash2 size={15} /> Delete Account
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
