import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    LayoutGrid, Users, Calendar, Syringe, AlertTriangle, LogOut,
    Bell, Menu, Settings,
} from "lucide-react";
import { cn, Toast } from "../components/orgDashboard/Shared";
import OrgDashboardView from "../components/orgDashboard/Orgdashboardview";
import AppointmentsView from "../components/orgDashboard/Appointmentsview";
import AssignedChildrenView from "../components/orgDashboard/Assignedchildrenview";
import OverdueUpcomingView from "../components/orgDashboard/Overdueupcomingview";
import SettingsSection from "../components/orgDashboard/SettingsSection";
import {
    RescheduleModal,
    CompleteVaccinationModal,
    SendReminderModal,
    RegisterChildModal,
    EditChildModal,
} from "../components/orgDashboard/Orgmodals";

const NAV = [
    { id: "dashboard", label: "Overview", icon: LayoutGrid },
    { id: "appointments", label: "Appointment Requests", icon: Calendar, badge: "3" },
    { id: "children", label: "Assigned Children", icon: Users },
    { id: "overdue", label: "Overdue / Upcoming", icon: AlertTriangle },
];

export default function OrgDashboard() {
    const location = useLocation();
    const [view, setView] = useState("dashboard");
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const showModal = (id, payload) => setModal({ id, payload });
    const closeModal = () => setModal(null);
    const showToast = (msg, type = "info") => setToast({ msg, type });
    const switchView = (v) => { setView(v); setSidebarOpen(false); };

    const viewProps = { setView: switchView, showModal, showToast };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const action = params.get("action");
        if (!action) return;

        if (action === "notif") {
            // Provider/admin notifications are modeled as "reminder" modal in this dashboard.
            setModal("reminder");
        } else if (action === "profile") {
            setView("settings");
        }
    }, [location.search]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="pt-2 pb-3 px-2 space-y-0.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2">Provider</p>
                {NAV.map(({ id, label, icon: Icon, badge }) => (
                    <button key={id} onClick={() => switchView(id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 text-left", view === id ? "bg-emerald-100 text-emerald-800" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800")}>
                        <Icon size={18} className={cn("shrink-0", view === id ? "text-emerald-700" : "text-gray-500")} />
                        <span className="flex-1">{label}</span>
                        {badge && <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
                    </button>
                ))}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2 pt-4">Account</p>
                <button onClick={() => switchView("settings")} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 text-left", view === "settings" ? "bg-emerald-100 text-emerald-800" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800")}>
                    <Settings size={18} className={cn("shrink-0", view === "settings" ? "text-emerald-700" : "text-gray-500")} /> Settings
                </button>
            </div>
            <div className="mt-auto px-2 pb-4 border-t border-gray-100 pt-3">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0">
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* <header className="bg-emerald-800 h-16 px-5 flex items-center justify-between shadow-lg sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button className="lg:hidden text-white mr-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={22} />
                    </button>
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                        <Syringe size={18} className="text-emerald-800" />
                    </div>
                    <span className="text-white font-bold text-lg">Vacci<span className="text-emerald-300">Care</span> <span className="text-emerald-200 font-medium text-sm">Provider</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => showModal("reminder")} className="hidden sm:flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer border-0">
                        <Bell size={13} /> Send Reminder
                    </button>
                    <button className="relative w-9 h-9 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-white transition-colors cursor-pointer border-0">
                        <Bell size={17} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-emerald-800" />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-emerald-400 flex items-center justify-center text-white text-sm font-bold cursor-pointer">DS</button>
                </div>
            </header> */}

            <div className="flex flex-1 overflow-hidden">
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                <aside className={cn(
                    "fixed lg:static inset-y-0 left-0 top-16 z-20 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 overflow-y-auto",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                    <SidebarContent />
                </aside>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {view === "dashboard" && <OrgDashboardView {...viewProps} />}
                    {view === "appointments" && <AppointmentsView {...viewProps} />}
                    {view === "children" && <AssignedChildrenView {...viewProps} />}
                    {view === "overdue" && <OverdueUpcomingView {...viewProps} />}
                    {view === "settings" && <SettingsSection {...viewProps} />}
                </main>

            </div>
            <RescheduleModal open={modal?.id === "reschedule"} onClose={closeModal} showToast={showToast} />
            <CompleteVaccinationModal open={modal?.id === "complete"} onClose={closeModal} showToast={showToast} />
            <SendReminderModal open={modal?.id === "reminder"} onClose={closeModal} showToast={showToast} />

            <RegisterChildModal open={modal?.id === "registerChild"} onClose={closeModal} showToast={showToast} />

            <EditChildModal
                open={modal?.id === "editChild"}
                onClose={closeModal}
                showToast={showToast}
                childId={modal?.payload?.childId || ""}
            />

            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}