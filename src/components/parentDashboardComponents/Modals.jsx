import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calendar, Info, Check } from "lucide-react";
import { Modal, Btn, Input, Select, Textarea, FormGroup, Badge } from "./UI";
import { api } from "../../apis/index.jsx";

/* ─── 1. Register Child ─── */
export const RegisterChildModal = ({ open, onClose, showToast, onCreated }) => {
  const [saving, setSaving] = useState(false);

  // Backend Child model fields (excluding parentId which backend sets from logged-in user)
  const [form, setForm] = useState({
    // required
    name: "",
    dateOfBirth: "",
    gender: "",

    // optional (editable)
    region: "Unknown",
    assignedProviderId: "",
    bloodGroup: "",
    allergies: "",
    lastCorrectionDate: "",

    // read/display-only (not sent as input during create)
    riskScore: 0,
    isActive: true,
    correctionApprovedBy: "",
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: "",
      dateOfBirth: "",
      gender: "",
      region: "Unknown",
      assignedProviderId: "",
      bloodGroup: "",
      allergies: "",
      lastCorrectionDate: "",
      riskScore: 0,
      isActive: true,
      correctionApprovedBy: "",
      createdAt: "",
      updatedAt: "",
    });
  }, [open]);

  const normalizeGender = (g) => {
    return String(g || "")
      .trim()
      .toLowerCase()
      .replace(/^female$/i, "female")
      .replace(/^male$/i, "male")
      .replace(/^other$/i, "other");
  };

  const handleRegister = async () => {
    if (!form.name?.trim() || !form.dateOfBirth || !form.gender) {
      showToast?.("Please fill all required fields: name, date of birth, gender.", "danger");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: normalizeGender(form.gender),
        region: form.region || "Unknown",
      };

      // only send if user provided value
      if (form.assignedProviderId?.trim()) payload.assignedProviderId = form.assignedProviderId.trim();
      if (form.bloodGroup !== undefined) payload.bloodGroup = form.bloodGroup; // may be "" allowed by enum
      if (form.allergies !== undefined) payload.allergies = form.allergies;
      if (form.lastCorrectionDate) payload.lastCorrectionDate = form.lastCorrectionDate;

      await api.createChild(payload);
      showToast?.("Child registered successfully! 🎉", "success");
      onCreated?.();
      onClose();
    } catch (e) {
      showToast?.(e?.message || "Failed to register child. Please try again.", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register New Child"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleRegister} disabled={saving}>
            {saving ? "Registering..." : "Register Child"}
          </Btn>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FormGroup label="Child Name *" full>
          <Input
            value={form.name}
            placeholder="e.g. Aarav Sharma"
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </FormGroup>

        <FormGroup label="Gender *" full>
          <Select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </Select>
        </FormGroup>

        <FormGroup label="Date of Birth *" full>
          <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
        </FormGroup>

        <FormGroup label="Blood Group">
          <Select value={form.bloodGroup} onChange={(e) => setForm((p) => ({ ...p, bloodGroup: e.target.value }))}>
            <option value="">Select blood group (optional)</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </Select>
        </FormGroup>

        <FormGroup label="Allergies">
          <Input value={form.allergies} placeholder="e.g. Peanut, Dust" onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} />
        </FormGroup>
      </div>
    </Modal>
  );
};

/* ─── 2. Book Appointment ─── */
export const BookApptModal = ({
  open,
  onClose,
  showToast,
  defaultChildId = "",

  // mode: "book" | "reschedule"
  mode = "book",

  // prefill for reschedule
  initialChildId = "",
  initialVaccinationId = "",
  initialDate = "",
  initialTime = "",
}) => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(defaultChildId);

  const [vaccinations, setVaccinations] = useState([]);
  const [selectedVaccinationId, setSelectedVaccinationId] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const todayStr = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  }, []);

  const [loadingChildren, setLoadingChildren] = useState(false);
  const [loadingVaccinations, setLoadingVaccinations] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Set base child first; also prefill if rescheduling.
    setSelectedChildId(defaultChildId || initialChildId || "");

    // Keep prefill values if provided; otherwise clear.
    setSelectedVaccinationId(initialVaccinationId || "");
    setSelectedDate(initialDate || "");
    setSelectedTime(initialTime || "");

    let mounted = true;

    (async () => {
      setLoadingChildren(true);
      try {
        const res = await api.listChildren();
        const list = res?.data ?? res ?? [];
        if (!mounted) return;
        setChildren(list);

        const firstId = list?.[0]?._id || list?.[0]?.id || "";
        const nextChildId = initialChildId || defaultChildId || firstId;
        setSelectedChildId(nextChildId);
      } catch (e) {
        showToast?.(e?.message || "Failed to load children", "danger");
      } finally {
        if (mounted) setLoadingChildren(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, defaultChildId, initialChildId, initialVaccinationId, initialDate, initialTime, showToast]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!open) return;
      if (!selectedChildId) return;

      setLoadingVaccinations(true);
      try {
        const res = await api.getVaccinationsByChild(selectedChildId);
        const list = res?.data ?? res ?? [];
        if (!mounted) return;
        setVaccinations(list);

        // If prefilled vaccination exists, keep it; otherwise clear for booking flow.
        setSelectedVaccinationId((prev) => prev || initialVaccinationId || "");
      } catch (e) {
        showToast?.(e?.message || "Failed to load vaccination records", "danger");
        if (!mounted) return;
        setVaccinations([]);
        setSelectedVaccinationId("");
      } finally {
        if (mounted) setLoadingVaccinations(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, selectedChildId, showToast, initialVaccinationId]);

  const dueVaccinations = useMemo(() => {
    // Per requirement update: show vaccines that are not completed.
    // (We intentionally do NOT filter by dueDate here, because UI was showing none.)
    return (vaccinations || []).filter((v) => v && v.status !== "completed");
  }, [vaccinations]);

  // Defensive: make sure the chosen vaccination stays valid after filtering.
  useEffect(() => {
    if (!open) return;
    if (!selectedVaccinationId) return;

    const stillValid = dueVaccinations.some((v) => (v?._id || v?.id) === selectedVaccinationId);
    if (!stillValid) setSelectedVaccinationId("");
  }, [open, selectedVaccinationId, dueVaccinations]);

  const canSubmit = Boolean(open && selectedVaccinationId && selectedDate && selectedTime);

  const handleConfirm = async () => {
    if (!canSubmit) return;

    // Prevent selecting past dates (UI-level guard).
    if (selectedDate < todayStr) {
      showToast?.("Preferred Date cannot be in the past.", "danger");
      return;
    }

    // Prevent booking vaccines that are already completed (UI-level guard).
    const selected = dueVaccinations.find((v) => (v?._id || v?.id) === selectedVaccinationId);
    if (!selected) {
      showToast?.("Selected vaccination is already completed.", "danger");
      return;
    }

    try {
      if (mode === "reschedule") {
        const res = await api.rescheduleAppointment(selectedVaccinationId, { selectedDate, selectedTime });
        onClose();
        showToast?.(res?.message || "Appointment rescheduled successfully!", "success");
        return;
      }

      const res = await api.bookAppointment(selectedVaccinationId, { selectedDate, selectedTime });
      onClose();
      showToast?.(res?.message || "Appointment booked successfully!", "success");
    } catch (e) {
      showToast?.(e?.message || (mode === "reschedule" ? "Failed to reschedule appointment" : "Failed to book appointment"), "danger");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Book New Appointment"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleConfirm} disabled={!canSubmit || loadingChildren || loadingVaccinations}>
            Confirm Booking
          </Btn>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FormGroup label="Select Child *" full>
          <Select
            value={selectedChildId}
            onChange={(e) => {
              setSelectedChildId(e.target.value);
              // Do not forcibly clear selectedVaccinationId here.
              // It can temporarily disable "Confirm Booking" even when a valid time (e.g., 09:00 AM) is selected.
              // A later effect will clear it only if it isn't valid for the new child's due vaccinations.
            }}
          >
            <option value="">{loadingChildren ? "Loading..." : "Choose a child"}</option>
            {children.map((c) => {
              const id = c?._id || c?.id;
              const label = c?.name || c?.fullName || `${c?.firstName || ""} ${c?.lastName || ""}`.trim() || "Child";
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </Select>
        </FormGroup>

        <FormGroup label="Select Vaccination Record *" full>
          <Select value={selectedVaccinationId} onChange={(e) => setSelectedVaccinationId(e.target.value)}>
            <option value="">{loadingVaccinations ? "Loading..." : dueVaccinations.length ? "Choose a due vaccination" : "No due vaccinations available"}</option>
            {dueVaccinations.map((v) => {
              const id = v?._id || v?.id;
              const dueLabel = v?.dueDate ? ` • Due ${String(v.dueDate).slice(0, 10)}` : "";
              return (
                <option key={id} value={id}>
                  {v?.vaccineName || v?.vaccine || "Vaccine"}
                  {dueLabel}
                </option>
              );
            })}
          </Select>
        </FormGroup>

        <FormGroup label="Preferred Date *">
          <Input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Preferred Time *">
          <Select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
            {["Select time", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FormGroup>
      </div>
    </Modal>
  );
};

/* ─── 3. Edit Appointment (minimal placeholder UI) ─── */
export const EditApptModal = ({ open, onClose, showToast }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Edit Appointment"
    footer={
      <>
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          variant="primary"
          onClick={() => {
            onClose();
            showToast?.("Appointment rescheduled!", "success");
          }}
        >
          Save Changes
        </Btn>
      </>
    }
  >
    <div className="text-sm text-gray-600">Edit appointment UI placeholder.</div>
  </Modal>
);

/* ─── 4. Edit Child Profile (editable + persisted) ─── */
export const EditChildModal = ({ open, onClose, showToast, childId, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",

    region: "Unknown",
    assignedProviderId: "",
    bloodGroup: "",
    allergies: "",
    lastCorrectionDate: "",

    // read-only/display fields (kept so we can show them; won't be sent)
    riskScore: 0,
    isActive: true,
    correctionApprovedBy: "",
    createdAt: "",
    updatedAt: "",
  });

  const normalizeGender = (g) =>
    String(g || "")
      .trim()
      .toLowerCase()
      .replace(/^female$/i, "female")
      .replace(/^male$/i, "male")
      .replace(/^other$/i, "other");

  const safeToDateInput = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (!open || !childId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const childRes = await api.listChildren();
        const childList = childRes?.data ?? childRes ?? [];
        const c = childList.find((x) => (x?._id || x?.id) === childId);

        if (!mounted) return;

        if (!c) {
          showToast?.("Child not found.", "danger");
          return;
        }

        setForm({
          name: c?.name || "",
          dateOfBirth: safeToDateInput(c?.dateOfBirth),
          gender: c?.gender || c?.sex || "",

          region: c?.region ?? "Unknown",
          assignedProviderId: c?.assignedProviderId ? String(c.assignedProviderId) : "",
          bloodGroup: c?.bloodGroup ?? "",
          allergies: c?.allergies ?? "",
          lastCorrectionDate: safeToDateInput(c?.lastCorrectionDate),

          riskScore: typeof c?.riskScore === "number" ? c.riskScore : 0,
          isActive: typeof c?.isActive === "boolean" ? c.isActive : true,
          correctionApprovedBy: c?.correctionApprovedBy ? String(c.correctionApprovedBy) : "",

          createdAt: c?.createdAt ? safeToDateInput(c.createdAt) : "",
          updatedAt: c?.updatedAt ? safeToDateInput(c.updatedAt) : "",
        });
      } catch (e) {
        if (mounted) showToast?.(e?.message || "Failed to load child.", "danger");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, childId, showToast]);

  const handleSave = async () => {
    if (!childId) return;

    // Backend required: name, dateOfBirth, gender
    if (!form.name?.trim() || !form.dateOfBirth || !form.gender) {
      showToast?.("Please fill all required fields (Name, Date of Birth, Gender).", "danger");
      return;
    }

    setSaving(true);
    try {
      // Do not send parentId, riskScore, isActive, correctionApprovedBy, timestamps.
      const payload = {
        name: form.name.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: normalizeGender(form.gender),

        region: form.region || "Unknown",
        assignedProviderId: form.assignedProviderId?.trim() ? form.assignedProviderId.trim() : undefined,
        bloodGroup: form.bloodGroup || "",
        allergies: form.allergies || "",
        lastCorrectionDate: form.lastCorrectionDate ? form.lastCorrectionDate : undefined,
      };

      // Remove undefined keys so backend validators don't get "undefined"
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await api.updateChild(childId, payload);
      showToast?.("Child profile updated successfully!", "success");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast?.(e?.message || "Failed to update child profile. Please try again.", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Child Profile"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={saving || loading}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Changes"}
          </Btn>
        </>
      }
    >
      {loading ? (
        <div className="text-sm text-gray-500 py-2">Loading child details…</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Child Name *" full>
            <Input value={form.name} placeholder="e.g. Aarav Sharma" onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Gender *" full>
            <Select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>

          <FormGroup label="Date of Birth *" full>
            <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Blood Group">
            <Select value={form.bloodGroup} onChange={(e) => setForm((p) => ({ ...p, bloodGroup: e.target.value }))}>

              <option value="">Select blood group (optional)</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </Select>
          </FormGroup>

          <FormGroup label="Allergies">
            <Input value={form.allergies} placeholder="e.g. Peanut, Dust" onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} />
          </FormGroup>


        </div>
      )}
    </Modal>
  );
};

/* ─── 5. Edit Parent Profile (FIXED: use logged-in details + editable) ─── */
export const EditProfileModal = ({ open, onClose, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    relationship: "Mother",
    preferredLanguage: "English",
  });

  const [avatarPreview, setAvatarPreview] = useState(null); // dataURL
  const [avatarBase64, setAvatarBase64] = useState(null); // base64/dataURL

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.me();
        const data = res?.data ?? res ?? {};

        const fullName = data?.name || data?.fullName || "";
        const parts = fullName ? fullName.trim().split(/\s+/) : [];
        const firstName = data?.firstName || parts[0] || "";
        const lastName = data?.lastName || parts.slice(1).join(" ") || "";

        if (!mounted) return;

        setForm({
          firstName,
          lastName,
          email: data?.email || "",
          phone: data?.phone || data?.mobile || "",
          address: data?.address || data?.location || "",
          emergencyContactName: data?.emergencyContactName || data?.emergencyName || "",
          emergencyContactPhone: data?.emergencyContactPhone || data?.emergencyPhone || "",
          relationship: data?.relationship || "Mother",
          preferredLanguage: data?.preferredLanguage || "English",
        });

        const existingAvatar =
          data?.profileImage || data?.avatar || data?.profilePhoto || data?.imageUrl || data?.photoUrl || null;

        // If backend returns a URL (not base64), show it as preview.
        if (existingAvatar) setAvatarPreview(existingAvatar);
      } catch (e) {
        if (mounted) showToast?.(e?.message || "Failed to load profile details", "danger");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, showToast]);

  const handlePickAvatar = (file) => {
    if (!file) return;

    // Convert + downscale image to avoid PayloadTooLargeError (base64 JSON bodies can be huge)
    const maxSide = 256; // px
    const maxBytes = 120 * 1024; // ~120KB base64 target budget (best-effort)

    const reader = new FileReader();
    reader.onload = () => {
      const originalUrl = reader.result;

      const img = new Image();
      img.onload = () => {
        const { width, height } = img;

        const scale = Math.min(1, maxSide / Math.max(width, height));
        const targetW = Math.max(1, Math.round(width * scale));
        const targetH = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          showToast?.("Failed to process selected image", "danger");
          return;
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Try a few compressions until we fit budget.
        const tryEncode = (quality) =>
          new Promise((resolve) => {
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(dataUrl);
          });

        (async () => {
          let dataUrl = await tryEncode(0.85);
          // approximate bytes: base64 overhead; still good enough for preventing very large payloads
          const approxBytes = Math.round((dataUrl.length * 3) / 4);

          if (approxBytes > maxBytes) {
            dataUrl = await tryEncode(0.65);
          }
          if (Math.round((dataUrl.length * 3) / 4) > maxBytes) {
            dataUrl = await tryEncode(0.5);
          }

          const finalBytes = Math.round((dataUrl.length * 3) / 4);
          if (finalBytes > maxBytes) {
            showToast?.("Selected image is too large to upload. Please choose a smaller image.", "danger");
            return;
          }

          setAvatarPreview(dataUrl);
          setAvatarBase64(dataUrl);
        })();
      };

      img.onerror = () => {
        showToast?.("Failed to read selected image", "danger");
      };

      img.src = originalUrl;
    };

    reader.onerror = () => {
      showToast?.("Failed to read selected image", "danger");
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullName = `${form.firstName || ""} ${form.lastName || ""}`.trim();

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        name: fullName,
        fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        relationship: form.relationship,
        preferredLanguage: form.preferredLanguage,
        ...(avatarBase64
          ? {
            avatar: avatarBase64,
            profileImage: avatarBase64,
            profilePhoto: avatarBase64,
            image: avatarBase64,
          }
          : {}),
      };

      await api.updateProfile(payload);
      showToast?.("Profile updated successfully!", "success");
      onClose();
    } catch (e) {
      const msg = String(e?.message || "");
      const isTooLarge =
        e?.status === 413 ||
        msg.toLowerCase().includes("payloadtoolarge") ||
        msg.toLowerCase().includes("too large") ||
        msg.toLowerCase().includes("413");

      showToast?.(
        isTooLarge
          ? "Could not save because the selected image is too large. Please choose a smaller image."
          : e?.message || "Failed to save profile. Please try again.",
        "danger"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit My Profile"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSave} disabled={saving || loading}>
            Save Changes
          </Btn>
        </>
      }
    >
      {loading ? (
        <div className="text-sm text-gray-500 py-2">Loading your profile…</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Circle placeholder / preview */}
          <div className="col-span-2 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {avatarPreview ? (
                // If avatarPreview is a dataURL or URL, it will work.
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-700 font-bold">SR</span>
              )}
            </div>

            <div className="flex-1">
              <FormGroup label="Profile Photo">
                <Input
                  type="file"
                  accept="image/*"
                  className="py-1.5"
                  onChange={(e) => handlePickAvatar(e.target.files?.[0])}
                />
              </FormGroup>
              <p className="text-xs text-gray-500 mt-1">Choose an image; it will be previewed and saved.</p>
            </div>
          </div>

          <FormGroup label="First Name">
            <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Last Name">
            <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Email Address" full>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Phone Number">
            <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Relationship to Child">
            <Select value={form.relationship} onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value }))}>
              <option>Mother</option>
              <option>Father</option>
              <option>Guardian</option>
            </Select>
          </FormGroup>

          <FormGroup label="Address" full>
            <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Emergency Contact Name">
            <Input
              value={form.emergencyContactName}
              onChange={(e) => setForm((p) => ({ ...p, emergencyContactName: e.target.value }))}
            />
          </FormGroup>

          <FormGroup label="Emergency Contact Phone">
            <Input
              type="tel"
              value={form.emergencyContactPhone}
              onChange={(e) => setForm((p) => ({ ...p, emergencyContactPhone: e.target.value }))}
            />
          </FormGroup>

          <FormGroup label="Preferred Language">
            <Select value={form.preferredLanguage} onChange={(e) => setForm((p) => ({ ...p, preferredLanguage: e.target.value }))}>
              <option>English</option>
              <option>Nepali</option>
            </Select>
          </FormGroup>
        </div>
      )}
    </Modal>
  );
};

/* ─── 6. Notifications (backend-driven) ─── */
export const NotifModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const childRes = await api.listChildren();
        const children = childRes?.data ?? childRes ?? [];
        const childIds = children.map((c) => c?._id || c?.id).filter(Boolean);

        const byChild = {};
        await Promise.all(
          childIds.map(async (id) => {
            const vRes = await api.getVaccinationsByChild(id);
            byChild[id] = vRes?.data ?? vRes ?? [];
          })
        );

        const now = Date.now();
        const dueSoonMs = 7 * 24 * 60 * 60 * 1000;

        const parseDateMs = (d) => {
          if (!d) return null;
          const t = new Date(d).getTime();
          return Number.isNaN(t) ? null : t;
        };

        const childName = (childId) => {
          const c = children.find((x) => (x?._id || x?.id) === childId);
          return c?.name || c?.fullName || c?.firstName || "Child";
        };

        const derived = [];

        for (const cid of childIds) {
          const list = byChild[cid] || [];
          for (const v of list) {
            const vaccineName = v?.vaccineName || "Vaccine";
            const dueMs = parseDateMs(v?.dueDate);
            const lastReminderMs = parseDateMs(v?.lastReminderDate);

            const overdue = v?.status === "overdue" || (dueMs !== null && dueMs < now);
            if (overdue) {
              derived.push({
                type: "danger",
                icon: AlertTriangle,
                title: `${childName(cid)}'s ${vaccineName} is overdue`,
                desc: "This vaccine is overdue. Please book an appointment as soon as possible.",
                time: "Overdue",
                key: `${cid}-${v?._id || v?.id}-overdue`,
              });
              continue;
            }

            const dueInRange = dueMs !== null && dueMs >= now && dueMs <= now + dueSoonMs;
            if (dueInRange) {
              derived.push({
                type: "warn",
                icon: Calendar,
                title: `Reminder: ${childName(cid)} – ${vaccineName}`,
                desc: `Due on ${new Date(dueMs).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
                time: "Due soon",
                key: `${cid}-${v?._id || v?.id}-dueSoon`,
              });
              continue;
            }

            if (lastReminderMs !== null && lastReminderMs >= now - 30 * 24 * 60 * 60 * 1000) {
              derived.push({
                type: "info",
                icon: Info,
                title: `Reminder update: ${childName(cid)} – ${vaccineName}`,
                desc: "A reminder was sent recently.",
                time: "Recent",
                key: `${cid}-${v?._id || v?.id}-reminder`,
              });
            }
          }
        }

        const seen = new Set();
        const finalItems = derived
          .filter((x) => {
            if (seen.has(x.key)) return false;
            seen.add(x.key);
            return true;
          })
          .slice(0, 8);

        if (mounted) setItems(finalItems);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notifications"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Mark all as read
          </Btn>
          <Btn variant="primary" onClick={onClose}>
            Close
          </Btn>
        </>
      }
    >
      {loading ? (
        <div className="text-sm text-gray-500 py-2">Loading notifications…</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No notifications available.</div>
          ) : (
            items.map(({ type, icon: Icon, title, desc, time, key }) => {
              const iconColors = {
                danger: "bg-red-100 text-red-600",
                warn: "bg-yellow-100 text-yellow-600",
                info: "bg-blue-100 text-blue-700",
                success: "bg-green-100 text-green-700",
              };
              return (
                <div key={key} className="flex gap-3 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconColors[type]}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                    <p className="text-xs text-gray-400 mt-1">{time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Modal>
  );
};

/* ─── 8. Vaccination Report ─── */
export const VaccinationReportModal = ({ open, onClose, showToast, vaccination, childLabel }) => {
  const [record, setRecord] = useState(null);

  useEffect(() => {
    if (!open) return;
    setRecord(vaccination || null);
  }, [open, vaccination]);

  const safeDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-US");
  };

  const status = record?.status || "—";
  const vaccineName = record?.vaccineName || record?.vaccine || "Vaccine";

  const to24h = (timeStr) => {
    if (!timeStr) return "—";
    const s = String(timeStr).trim();

    // If already in HH:MM (24h)
    if (/^\d{1,2}:\d{2}$/.test(s)) {
      const [hh, mm] = s.split(":");
      return `${String(hh).padStart(2, "0")}:${mm}`;
    }

    // Parse "10:30 AM" / "10:30 PM"
    const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m) {
      let hh = parseInt(m[1], 10);
      const mm = m[2];
      const ap = m[3].toUpperCase();
      if (ap === "PM" && hh !== 12) hh += 12;
      if (ap === "AM" && hh === 12) hh = 0;
      return `${String(hh).padStart(2, "0")}:${mm}`;
    }

    return s; // fallback
  };

  const nepaliTimeLabel = (timeStr) => {
    const t24 = to24h(timeStr);
    return t24 === "—" ? "—" : `${t24} (नेपाल समय)`;
  };

  const statusBadge =
    status === "completed"
      ? { color: "green", label: "Completed" }
      : status === "cancelled"
        ? { color: "red", label: "Cancelled" }
        : status === "overdue"
          ? { color: "red", label: "Overdue" }
          : { color: "blue", label: status };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vaccination Report"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Close
          </Btn>
          <Btn
            variant="primary"
            onClick={() => {
              onClose();
              showToast?.("Report closed.", "success");
            }}
          >
            Done
          </Btn>
        </>
      }
    >
      {!record ? (
        <div className="text-sm text-gray-600">No vaccination record selected.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm text-gray-500">Child</p>
              <p className="text-base font-semibold text-gray-900">{childLabel || "Child"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Vaccine</p>
            <p className="text-base font-semibold text-gray-900">{vaccineName}</p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500">Due date</p>
                <p className="text-sm font-semibold text-gray-900">{safeDate(record?.dueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled date</p>
                <p className="text-sm font-semibold text-gray-900">{safeDate(record?.scheduledDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Appointment time (24h)</p>
                <p className="text-sm font-semibold text-gray-900">
                  {nepaliTimeLabel(record?.appointmentTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed date</p>
                <p className="text-sm font-semibold text-gray-900">{safeDate(record?.completedDate)}</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-sm font-medium text-gray-900">{record?.notes || "—"}</p>
            </div>

            {record?.anomalyFlag !== undefined && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">AI Anomaly Flag</p>
                <p className="text-sm font-semibold text-gray-900">
                  {record?.anomalyFlag ? "Yes" : "No"}
                </p>
                {record?.anomalyReason && (
                  <p className="text-xs text-gray-600 mt-1">{record?.anomalyReason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
