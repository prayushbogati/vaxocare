import { useEffect, useState } from "react";
import { api } from "../../apis";
import { Btn, Badge, cn, } from "./UI";

const NotificationsSection = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [tab, setTab] = useState("queue");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        if (tab === "history") {
          const p = await api.adminReminderPriorityList(10);
          const list = Array.isArray(p) ? p : p?.data ?? [];
          if (mounted) setCount(Array.isArray(list) ? list.length : 0);
        } else {
          const [q] = await Promise.all([api.adminReminderQueue()]);
          if (mounted) setCount(q?.totalInQueue ?? q?.total ?? 0);
        }
      } catch (e) {
        showToast?.(e?.message || "Failed to load reminders", "danger");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex gap-2 mb-3">
        <Btn variant={tab === "queue" ? "primary" : "outline"} size="sm" onClick={() => setTab("queue")}>
          Queue
        </Btn>
        <Btn variant={tab === "history" ? "primary" : "outline"} size="sm" onClick={() => setTab("history")}>
          Priority
        </Btn>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="flex items-center gap-2">
          <Badge color="blue">{count}</Badge>
          <span className="text-sm text-gray-700">{tab === "queue" ? "in queue" : "priority items"}</span>
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
