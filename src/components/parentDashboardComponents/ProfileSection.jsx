import { useEffect, useMemo, useState } from "react";
import { Edit2, User, Mail, Phone, MapPin, Shield } from "lucide-react";
import { api } from "../../apis/index.jsx";
import { Btn, Input, FormGroup, Toggle } from "./UI";

const ProfileSection = ({ showModal, showToast }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const res = await api.me();
        const data = res?.data ?? res;
        if (mounted) setProfile(data || null);
      } catch (e) {
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const derived = useMemo(() => {
    const fullName =
      profile?.name ||
      profile?.fullName ||
      [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
      "";

    const email = profile?.email || "";
    const phone = profile?.phone || profile?.mobile || "";
    const address = profile?.address || profile?.location || "";
    const emergencyName = profile?.emergencyContactName || profile?.emergencyName || "";
    const emergencyPhone = profile?.emergencyContactPhone || profile?.emergencyPhone || "";
    const emergency =
      emergencyName || emergencyPhone ? `${emergencyName || "Emergency"}${emergencyPhone ? ` – ${emergencyPhone}` : ""}` : "";

    const initials = fullName
      ? fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
      : "SR";

    const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";
    const childrenCount = profile?.childrenCount ?? profile?.children?.length ?? null;

    return { fullName, email, phone, address, emergency, initials, memberSince, childrenCount };
  }, [profile]);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl p-6 flex items-center gap-5 mb-6 text-white flex-wrap">
        <div className="w-16 h-16 rounded-full bg-white/25 border-2 border-white/60 flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden">
          {profile?.profileImage ||
          profile?.avatar ||
          profile?.imageUrl ||
          profile?.photoUrl ||
          profile?.profilePhoto ? (
            <img
              src={
                profile?.profileImage ||
                profile?.avatar ||
                profile?.imageUrl ||
                profile?.photoUrl ||
                profile?.profilePhoto
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            derived.initials
          )}
        </div>

        <div className="flex-1 min-w-[180px]">
          <p className="text-xl font-bold">{derived.fullName || "—"}</p>
          <p className="text-blue-200 text-sm mt-0.5">{derived.email || "—"}</p>
          <p className="text-blue-300 text-xs mt-1">
            {derived.memberSince ? `Member since ${derived.memberSince}` : "Member information unavailable"}
            {derived.childrenCount !== null ? ` · ${derived.childrenCount} children registered` : ""}
          </p>
        </div>

        <Btn
          variant="outline"
          onClick={() => showModal("editProfile")}
          className="bg-white/15 text-white border-white/40 hover:bg-white/25 hover:border-white/60 shrink-0"
        >
          <Edit2 size={14} /> Edit Profile
        </Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Personal Information</h3>
            <Btn variant="outline" size="sm" onClick={() => showModal("editProfile")}>
              Edit
            </Btn>
          </div>

          <div className="p-5 space-y-4">
            {[
              { label: "Full Name", value: derived.fullName || "—", icon: User },
              { label: "Email Address", value: derived.email || "—", icon: Mail },
              { label: "Phone Number", value: derived.phone || "—", icon: Phone },
              { label: "Address", value: derived.address || "—", icon: MapPin },
              { label: "Emergency Contact", value: derived.emergency || "—", icon: Shield },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Notification Preferences</h3>
          </div>

          <div className="p-5 divide-y divide-gray-100">
            {/* Preferences schema unknown; keep toggles but remove static labels/data wiring */}
            {[
              { label: "Email Reminders", desc: "Vaccine due date alerts via email", on: true },
              { label: "SMS Notifications", desc: "Appointment confirmations by SMS", on: true },
              { label: "Overdue Alerts", desc: "Notify when a vaccine is overdue", on: true },
              { label: "Weekly Digest", desc: "Weekly summary of schedule", on: false },
            ].map(({ label, desc, on }) => (
              <div key={label} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <Toggle defaultOn={on} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Change Password</h3>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Current Password">
              <Input type="password" placeholder="••••••••" />
            </FormGroup>
            <div />
            <FormGroup label="New Password">
              <Input type="password" placeholder="Min. 8 characters" />
            </FormGroup>
            <FormGroup label="Confirm New Password">
              <Input type="password" placeholder="Repeat new password" />
            </FormGroup>
          </div>

          <div className="mt-4">
            <Btn variant="primary" onClick={() => showToast("Password update is handled on backend.", "success")}>
              Update Password
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
