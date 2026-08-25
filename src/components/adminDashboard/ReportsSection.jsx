import { useState } from "react";
import { api } from "../../apis";
import { Btn, FormGroup, Input, Select, cn } from "./UI";
import {
  Calendar,
  Download,
  FileText,
  Search,
  Syringe,
  Users,
} from "lucide-react";

const downloadTextFile = (filename, text) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);

  a.click();

  a.remove();
  URL.revokeObjectURL(url);
};

const ReportsSection = ({ showToast }) => {
  const [loading, setLoading] = useState(false);

  // Vaccinations CSV
  const [vaccStatus, setVaccStatus] = useState("");
  const [vaccStartDate, setVaccStartDate] = useState("");
  const [vaccEndDate, setVaccEndDate] = useState("");

  // Children CSV
  const [childRiskLevel, setChildRiskLevel] = useState("");
  const [childIsActive, setChildIsActive] = useState("true");

  // Audit logs CSV
  const [auditUserId, setAuditUserId] = useState("");
  const [auditAction, setAuditAction] = useState("");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");

  // Monthly report JSON
  const now = new Date();
  const [reportMonth, setReportMonth] = useState(String(now.getMonth() + 1));
  const [reportYear, setReportYear] = useState(String(now.getFullYear()));
  const [monthlyReport, setMonthlyReport] = useState(null);

  const run = async (fn) => {
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      showToast?.(e?.message || "Export failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Export Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Minimal exports matching backend functionality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vaccinations CSV */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Syringe size={16} className="text-green-700" />
              <h3 className="text-sm font-bold text-gray-800">
                Vaccinations CSV
              </h3>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <FormGroup label="Status">
              <Select
                value={vaccStatus}
                onChange={(e) => setVaccStatus(e.target.value)}
              >
                <option value="">Any</option>
                <option value="completed">completed</option>
                <option value="pending">pending</option>
                <option value="overdue">overdue</option>
              </Select>
            </FormGroup>

            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Start Date">
                <Input
                  type="date"
                  value={vaccStartDate}
                  onChange={(e) => setVaccStartDate(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="End Date">
                <Input
                  type="date"
                  value={vaccEndDate}
                  onChange={(e) => setVaccEndDate(e.target.value)}
                />
              </FormGroup>
            </div>

            <Btn
              variant="primary"
              className={cn("w-full justify-center")}
              disabled={loading}
              onClick={() =>
                run(async () => {
                  const csv = await api.exportVaccinations({
                    status: vaccStatus || undefined,
                    startDate: vaccStartDate || undefined,
                    endDate: vaccEndDate || undefined,
                  });

                  downloadTextFile(
                    `vaccinations_${Date.now()}.csv`,
                    csv,
                  );
                  showToast?.("Vaccinations exported", "success");
                })
              }
            >
              <Download size={14} /> Export Vaccinations
            </Btn>
          </div>
        </div>

        {/* Children CSV */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-700" />
              <h3 className="text-sm font-bold text-gray-800">Children CSV</h3>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <FormGroup label="Risk Level">
              <Select
                value={childRiskLevel}
                onChange={(e) => setChildRiskLevel(e.target.value)}
              >
                <option value="">Any</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </Select>
            </FormGroup>

            <FormGroup label="Active Only">
              <Select
                value={childIsActive}
                onChange={(e) => setChildIsActive(e.target.value)}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </FormGroup>

            <Btn
              variant="primary"
              className={cn("w-full justify-center")}
              disabled={loading}
              onClick={() =>
                run(async () => {
                  const csv = await api.exportChildren({
                    riskLevel: childRiskLevel || undefined,
                    isActive: childIsActive,
                  });

                  downloadTextFile(
                    `children_${Date.now()}.csv`,
                    csv,
                  );
                  showToast?.("Children exported", "success");
                })
              }
            >
              <Download size={14} /> Export Children
            </Btn>

            <Btn
              variant="outline"
              className={cn("w-full justify-center")}
              disabled={loading}
              onClick={() =>
                run(async () => {
                  const csv = await api.exportHighRisk();
                  downloadTextFile(
                    `high_risk_children_${Date.now()}.csv`,
                    csv,
                  );
                  showToast?.("High risk children exported", "success");
                })
              }
            >
              <Download size={14} /> Export High Risk
            </Btn>
          </div>
        </div>

        {/* Audit Logs CSV */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gray-800" />
              <h3 className="text-sm font-bold text-gray-800">Audit Logs CSV</h3>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FormGroup label="User ID">
                <Input
                  type="text"
                  placeholder="(optional)"
                  value={auditUserId}
                  onChange={(e) => setAuditUserId(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Action">
                <Input
                  type="text"
                  placeholder="(optional)"
                  value={auditAction}
                  onChange={(e) => setAuditAction(e.target.value)}
                />
              </FormGroup>

              <div />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Start Date">
                <Input
                  type="date"
                  value={auditStartDate}
                  onChange={(e) => setAuditStartDate(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="End Date">
                <Input
                  type="date"
                  value={auditEndDate}
                  onChange={(e) => setAuditEndDate(e.target.value)}
                />
              </FormGroup>
            </div>

            <Btn
              variant="primary"
              className={cn("w-full justify-center")}
              disabled={loading}
              onClick={() =>
                run(async () => {
                  const csv = await api.exportAuditLogs({
                    userId: auditUserId || undefined,
                    action: auditAction || undefined,
                    startDate: auditStartDate || undefined,
                    endDate: auditEndDate || undefined,
                  });

                  downloadTextFile(
                    `audit_logs_${Date.now()}.csv`,
                    csv,
                  );
                  showToast?.("Audit logs exported", "success");
                })
              }
            >
              <Download size={14} /> Export Audit Logs
            </Btn>
          </div>
        </div>

        {/* Monthly Report JSON */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-yellow-700" />
              <h3 className="text-sm font-bold text-gray-800">
                Monthly Report (JSON)
              </h3>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FormGroup label="Month (1-12)">
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Year">
                <Input
                  type="number"
                  value={reportYear}
                  onChange={(e) => setReportYear(e.target.value)}
                />
              </FormGroup>

              <div className="flex items-end">
                <Btn
                  variant="primary"
                  className="w-full justify-center"
                  disabled={loading}
                  onClick={() =>
                    run(async () => {
                      const report = await api.exportMonthlyReport({
                        month: reportMonth,
                        year: reportYear,
                      });

                      setMonthlyReport(report);
                      showToast?.("Monthly report generated", "success");
                    })
                  }
                >
                  <Search size={14} /> Generate
                </Btn>
              </div>
            </div>

            {monthlyReport && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(monthlyReport, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
