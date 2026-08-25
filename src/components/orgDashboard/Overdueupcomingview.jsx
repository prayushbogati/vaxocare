import { useState } from "react";
import { AlertTriangle, Bell, Syringe } from "lucide-react";
import { Btn, Badge, cn } from "./Shared";

/* Maps to use case: View Overdue / Upcoming List */
const OverdueUpcomingView = ({ showModal, showToast }) => {
  const [filter, setFilter] = useState("overdue");
  const list = [
    { child: "Emma Rana", vaccine: "Varicella", due: "May 10, 2026", status: "overdue", daysLate: 53 },
    { child: "Priya Gurung", vaccine: "Rotavirus (2nd dose)", due: "May 22, 2026", status: "overdue", daysLate: 41 },
    { child: "Aayush Thapa", vaccine: "MMR", due: "Jun 2, 2026", status: "due" },
    { child: "Liam Rana", vaccine: "Hepatitis B Booster", due: "Jun 15, 2026", status: "upcoming" },
    { child: "Priya Gurung", vaccine: "Typhoid", due: "Jul 1, 2026", status: "upcoming" },
  ];
  const tabs = [["overdue", "Overdue"], ["due", "Due Soon"], ["upcoming", "Upcoming"]];
  const shown = list.filter(v => v.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Overdue &amp; Upcoming</h1>
        <p className="text-sm text-gray-500 mt-1">Vaccine worklist across all children assigned to your clinic.</p>
      </div>

      <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1 mb-5">
        {tabs.map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} className={cn("px-4 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer border-0", filter === val ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {shown.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Syringe size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Nothing here right now</p>
            </div>
          )}
          {shown.map(({ child, vaccine, due, status, daysLate }, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors flex-wrap">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", status === "overdue" ? "bg-red-100 text-red-600" : status === "due" ? "bg-amber-100 text-amber-600" : "bg-sky-100 text-sky-600")}>
                {status === "overdue" ? <AlertTriangle size={18} /> : <Syringe size={18} />}
              </div>
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-bold text-gray-800">{child} — {vaccine}</p>
                <p className="text-xs text-gray-500 mt-0.5">Due: {due}{daysLate ? ` · ${daysLate} days late` : ""}</p>
              </div>
              <Badge color={status === "overdue" ? "red" : status === "due" ? "yellow" : "blue"}>
                {status === "overdue" ? "Overdue" : status === "due" ? "Due Soon" : "Upcoming"}
              </Badge>
              <div className="flex gap-2 shrink-0">
                <Btn variant="outline" size="sm" onClick={() => showModal("reminder")}><Bell size={13} /> Remind Guardian</Btn>
                <Btn variant="primary" size="sm" onClick={() => showModal("complete")}>Complete Vaccine</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverdueUpcomingView;