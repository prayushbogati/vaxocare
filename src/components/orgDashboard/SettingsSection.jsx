import { useEffect, useMemo, useState } from "react";
import { Clock, Bell, Shield, Edit2 } from "lucide-react";
import { Btn, FormGroup, Input, Select, Toggle } from "../parentDashboardComponents/UI";
import { api } from "../../apis";

const SettingsSection = ({ showToast }) => {
    const [me, setMe] = useState(null);
    const [loadingMe, setLoadingMe] = useState(true);

    const [prefs, setPrefs] = useState({
        newRequests: true,
        overdueAlerts: true,
        dailySummary: false,
        smsAlerts: true,
    });
    const togglePref = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

    useEffect(() => {
        let mounted = true;
        const run = async () => {
            setLoadingMe(true);
            try {
                const res = await api.me();
                if (!mounted) return;
                setMe(res?.data ?? res ?? null);
            } catch {
                if (!mounted) return;
                setMe(null);
            } finally {
                if (mounted) setLoadingMe(false);
            }
        };
        run();
        return () => {
            mounted = false;
        };
    }, []);

    const initials = useMemo(() => {
        const n = me?.name ? String(me.name) : "";
        const parts = n.trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return "DS";
        const first = parts[0]?.[0] || "D";
        const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
        return (first + last).toUpperCase();
    }, [me]);

    const clinicLine = useMemo(() => {
        return me?.clinic || me?.address || "";
    }, [me]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your provider profile, availability, and notification preferences.
                </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-2xl p-6 flex items-center gap-5 mb-6 text-white flex-wrap">
                <div className="w-16 h-16 rounded-full bg-white/25 border-2 border-white/60 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {initials}
                </div>
                <div className="flex-1 min-w-[180px]">
                    <p className="text-xl font-bold">{loadingMe ? "Loading…" : me?.name || "Provider"}</p>
                    <p className="text-emerald-200 text-sm mt-0.5">
                        {(me?.specialty || "Provider") + (clinicLine ? ` · ${clinicLine}` : "")}
                    </p>
                    <p className="text-emerald-300 text-xs mt-1">Profile from database</p>
                </div>
                <Btn
                    variant="outline"
                    className="bg-white/15 text-white border-white/40 hover:bg-white/25 hover:border-white/60 flex-shrink-0"
                >
                    <Edit2 size={14} /> Edit Photo
                </Btn>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800">Provider Information</h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormGroup label="Full Name">
                            <Input defaultValue={me?.name || ""} />
                        </FormGroup>
                        <FormGroup label="Specialty">
                            <Input defaultValue={me?.specialty || ""} />
                        </FormGroup>
                        <FormGroup label="Email Address">
                            <Input type="email" defaultValue={me?.email || ""} />
                        </FormGroup>
                        <FormGroup label="Phone Number">
                            <Input type="tel" defaultValue={me?.phone || ""} />
                        </FormGroup>
                        <FormGroup label="Clinic" full>
                            <Input defaultValue={clinicLine || ""} />
                        </FormGroup>
                        <div className="col-span-2">
                            <Btn
                                variant="primary"
                                onClick={() => showToast?.("Profile save UI only (backend update not wired in this change).", "success")}
                            >
                                Save Profile
                            </Btn>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                        <Clock size={14} className="text-emerald-600" />
                        <h3 className="text-sm font-bold text-gray-800">Availability</h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormGroup label="Working Days">
                            <Select>
                                <option>Sun – Fri</option>
                                <option>Mon – Fri</option>
                                <option>Sun – Sat</option>
                            </Select>
                        </FormGroup>
                        <FormGroup label="Daily Appointment Cap">
                            <Input type="number" defaultValue={20} />
                        </FormGroup>
                        <FormGroup label="Start Time">
                            <Input type="time" defaultValue="08:00" />
                        </FormGroup>
                        <FormGroup label="End Time">
                            <Input type="time" defaultValue="16:00" />
                        </FormGroup>
                        <div className="col-span-2">
                            <Btn
                                variant="primary"
                                onClick={() => showToast?.("Availability saved UI only (backend update not wired in this change).", "success")}
                            >
                                Save Availability
                            </Btn>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Bell size={14} className="text-emerald-600" />
                    <h3 className="text-sm font-bold text-gray-800">Notification Preferences</h3>
                </div>
                <div className="p-5 divide-y divide-gray-100">
                    {[
                        {
                            key: "newRequests",
                            label: "New Appointment Requests",
                            desc: "Alert me when a guardian books a new appointment",
                        },
                        {
                            key: "overdueAlerts",
                            label: "Overdue Vaccine Alerts",
                            desc: "Alert me when a child on my list becomes overdue",
                        },
                        {
                            key: "smsAlerts",
                            label: "SMS Alerts",
                            desc: "Send urgent alerts via SMS in addition to email",
                        },
                        {
                            key: "dailySummary",
                            label: "Daily Summary Email",
                            desc: "A daily digest of your schedule and pending items",
                        },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between py-3.5">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                            </div>
                            <Toggle checked={prefs[key]} onChange={() => togglePref(key)} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Shield size={14} className="text-emerald-600" />
                    <h3 className="text-sm font-bold text-gray-800">Change Password</h3>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormGroup label="Current Password" full>
                            <Input type="password" placeholder="••••••••" />
                        </FormGroup>
                        <FormGroup label="New Password">
                            <Input type="password" placeholder="Min. 8 characters" />
                        </FormGroup>
                        <FormGroup label="Confirm New Password">
                            <Input type="password" placeholder="Repeat new password" />
                        </FormGroup>
                    </div>
                    <div className="mt-4">
                        <Btn variant="primary" onClick={() => showToast?.("Password update not wired in this change.", "success")}>
                            Update Password
                        </Btn>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsSection;
