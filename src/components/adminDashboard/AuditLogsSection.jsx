import { useEffect, useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { api } from "../../apis";
import { Btn, Badge, Table, Tr, Td } from "./UI";

const roleColor = { admin: "red", system: "gray", provider: "green", parent: "blue" };

const typeColor = {
  approval: "blue",
  system: "gray",
  vaccine: "green",
  booking: "purple",
  role: "orange",
  export: "blue",
  override: "yellow",
  user: "green",
};

const normalizeLog = (log) => {
  // backend model: timestamps=true => createdAt
  // populated userId => { name, email, role }
  const id = log?.id ?? log?._id ?? "—";
  const ts = log?.createdAt ?? log?.timestamp ?? log?.ts ?? log?.time ?? null;

  const userId = log?.userId ?? {};
  const user = userId?.name ?? userId?.email ?? log?.user ?? log?.actor ?? "—";
  const role = userId?.role ?? log?.role ?? log?.userRole ?? "system";

  const action = log?.action ?? log?.description ?? log?.event ?? "—";
  const ip = log?.ipAddress ?? log?.ip ?? "—";

  // backend: targetType (e.g., PROVIDER, VACCINATION, etc.)
  const type = log?.targetType ?? log?.type ?? "user";

  return { id, ts, user, role, action, ip, type };
};

const formatTimestamp = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
};

const AuditLogsSection = ({ showToast }) => {
  const [page, setPage] = useState(1);
  const limit = 20;

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const res = await api.adminAuditLogs(page, limit);
        if (!mounted) return;

        // backend response: { data: [...], pagination: {...} }
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.logs)
            ? res.logs
            : [];

        setLogs(list);

        setPagination(
          res?.pagination && typeof res.pagination === "object"
            ? res.pagination
            : { total: list.length, pages: 1 },
        );
      } catch (e) {
        if (!mounted) return;
        showToast?.(e?.message || "Failed to load audit logs", "danger");
        setLogs([]);
        setPagination({ total: 0, pages: 1 });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [page, showToast]);

  const normalizedLogs = useMemo(() => (logs || []).map(normalizeLog), [logs]);

  return (
    <div className="p-4">
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} className="text-blue-700" />
            <span className="text-sm font-bold text-gray-700">
              Showing {normalizedLogs.length} entries
              {pagination?.total ? ` (total ${pagination.total})` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Btn
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Btn>

            <span className="text-xs text-gray-500 font-semibold">
              Page {page} / {pagination?.pages || 1}
            </span>

            <Btn
              variant="ghost"
              size="sm"
              disabled={page >= (pagination?.pages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Btn>
          </div>
        </div>

        <div className="bg-white">
          <Table heads={["Log ID", "Timestamp", "User", "Role", "Action", "Type", "IP Address"]}>
            {normalizedLogs.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No log entries found.
                </td>
              </tr>
            )}

            {normalizedLogs.map((log) => (
              <Tr key={log.id}>
                <Td>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {log.id}
                  </span>
                </Td>

                <Td gray>{formatTimestamp(log.ts)}</Td>

                <Td bold>{log.user}</Td>

                <Td>
                  <Badge color={roleColor[log.role] || "gray"}>{log.role}</Badge>
                </Td>

                <Td className="max-w-xs">
                  <span
                    className="block truncate text-gray-700"
                    title={log.action}
                  >
                    {log.action}
                  </span>
                </Td>

                <Td>
                  <Badge color={typeColor[log.type] || "gray"}>{log.type}</Badge>
                </Td>

                <Td gray>
                  <span className="font-mono text-xs">{log.ip}</span>
                </Td>
              </Tr>
            ))}
          </Table>

          {loading && (
            <div className="px-5 py-4 text-sm text-gray-500">Loading…</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsSection;
