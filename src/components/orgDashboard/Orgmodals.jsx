import { useEffect, useState } from "react";
import { Info, ShieldCheck, ShieldAlert, Check, Bell } from "lucide-react";
import { Modal, Btn, FormGroup, Input, Select, Textarea } from "./Shared";
import { api } from "../../apis";

/* Maps to use case: Reschedule Appointment */
export const RescheduleModal = ({ open, onClose, showToast }) => (
    <Modal open={open} onClose={onClose} title="Reschedule Appointment"
        footer={<>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { onClose(); showToast("Appointment rescheduled and guardian notified", "success"); }}>Save New Time</Btn>
        </>}>
        <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 flex items-start gap-2 text-sm text-sky-800 mb-4">
            <Info size={15} className="mt-0.5 shrink-0" />
            The guardian will automatically receive a notification with the new date and time.
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Child" full><Input defaultValue="Emma Rana — MMR Vaccine" readOnly className="bg-gray-50 cursor-default" /></FormGroup>
            <FormGroup label="New Date *"><Input type="date" defaultValue="2026-06-05" /></FormGroup>
            <FormGroup label="New Time *"><Select><option>10:30 AM</option><option>9:00 AM</option><option>11:00 AM</option><option>1:00 PM</option></Select></FormGroup>
            <FormGroup label="Reason" full><Textarea placeholder="Optional — let the guardian know why this was rescheduled" /></FormGroup>
        </div>
    </Modal>
);

/* Maps to use cases: Complete Vaccination, Rule-Based Validation Check, Apply Manual Override */
export const CompleteVaccinationModal = ({ open, onClose, showToast }) => {
    const [checked, setChecked] = useState(false);
    const [validation, setValidation] = useState(null); // "pass" | "fail" | null
    const [overrideOpen, setOverrideOpen] = useState(false);
    const [overrideReason, setOverrideReason] = useState("");

    const runValidation = () => {
        setChecked(true);
        // Simulated rule-based check, e.g. minimum interval since last dose
        setValidation("fail");
    };

    const reset = () => { setChecked(false); setValidation(null); setOverrideOpen(false); setOverrideReason(""); };
    const handleClose = () => { reset(); onClose(); };

    return (
        <Modal open={open} onClose={handleClose} title="Complete Vaccination"
            footer={<>
                <Btn variant="ghost" onClick={handleClose}>Cancel</Btn>
                <Btn
                    variant="primary"
                    disabled={validation === "fail" && !overrideReason}
                    onClick={() => {
                        handleClose();
                        showToast(
                            validation === "fail" && overrideReason
                                ? "Vaccination recorded with manual override"
                                : "Vaccination recorded successfully",
                            "success"
                        );
                    }}
                >
                    <Check size={14} /> Confirm &amp; Record
                </Btn>
            </>}>
            <div className="grid grid-cols-2 gap-4 mb-5">
                <FormGroup label="Child" full><Input defaultValue="Aayush Thapa" readOnly className="bg-gray-50 cursor-default" /></FormGroup>
                <FormGroup label="Vaccine *"><Select><option>DTP Booster</option><option>MMR</option><option>Varicella</option></Select></FormGroup>
                <FormGroup label="Date Administered *"><Input type="date" defaultValue="2026-07-02" /></FormGroup>
                <FormGroup label="Dose / Batch No."><Input placeholder="e.g. LOT-22841" /></FormGroup>
                <FormGroup label="Administered By"><Input defaultValue="Dr. Sharma" /></FormGroup>
                <FormGroup label="Clinical Notes" full><Textarea placeholder="Any reactions or observations…" /></FormGroup>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Rule-Based Validation Check</p>
                {!checked && (
                    <Btn variant="outline" size="sm" onClick={runValidation}><ShieldCheck size={14} /> Run Validation Check</Btn>
                )}
                {checked && validation === "pass" && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-2 text-sm text-emerald-800">
                        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                        Passed. Minimum interval and age requirements are satisfied.
                    </div>
                )}
                {checked && validation === "fail" && (
                    <div className="space-y-3">
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
                            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                            Failed: only 18 days since the previous dose (28-day minimum interval required).
                        </div>
                        {!overrideOpen ? (
                            <Btn variant="danger" size="sm" onClick={() => setOverrideOpen(true)}>Apply Manual Override</Btn>
                        ) : (
                            <FormGroup label="Override Justification *" full hint="Required to bypass the validation rule — this is logged for audit.">
                                <Textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="e.g. Catch-up schedule approved by supervising physician" />
                            </FormGroup>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

/* Maps to use case: Send Notification Reminder */
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

/* ─── Parent/Org: Register Child ─── */
export const RegisterChildModal = ({ open, onClose, showToast, onCreated }) => {
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
    });
  }, [open]);

  const handleRegister = async () => {
    if (!form.name?.trim() || !form.dateOfBirth || !form.gender) {
      showToast?.("Please fill required fields: Name, Date of Birth, Gender.", "danger");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: normalizeGender(form.gender),
      };

      if (form.region) payload.region = String(form.region);
      if (form.assignedProviderId?.trim()) payload.assignedProviderId = form.assignedProviderId.trim();
      if (form.bloodGroup !== undefined) payload.bloodGroup = form.bloodGroup || "";
      if (form.allergies !== undefined) payload.allergies = form.allergies || "";
      if (form.lastCorrectionDate) payload.lastCorrectionDate = form.lastCorrectionDate;

      await api.createChild(payload);
      showToast?.("Child registered successfully!", "success");
      onCreated?.();
      onClose();
    } catch (e) {
      showToast?.(e?.message || "Failed to register child.", "danger");
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

        <FormGroup label="Region">
          <Input value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} />
        </FormGroup>

        <FormGroup label="Assigned Provider ID">
          <Input
            value={form.assignedProviderId}
            placeholder="(optional)"
            onChange={(e) => setForm((p) => ({ ...p, assignedProviderId: e.target.value }))}
          />
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

        <FormGroup label="Last Correction Date">
          <Input type="date" value={form.lastCorrectionDate} onChange={(e) => setForm((p) => ({ ...p, lastCorrectionDate: e.target.value }))} />
        </FormGroup>
      </div>
    </Modal>
  );
};

/* ─── Parent/Org: Edit Child ─── */
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

    // display-only
    riskScore: 0,
    isActive: true,
    correctionApprovedBy: "",
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    if (!open || !childId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.listChildren();
        const list = res?.data ?? res ?? [];
        const c = list.find((x) => String(x?._id || x?.id) === String(childId));

        if (!mounted) return;
        if (!c) {
          showToast?.("Child not found.", "danger");
          return;
        }

        setForm({
          name: c?.name || "",
          dateOfBirth: safeToDateInput(c?.dateOfBirth),
          gender: c?.gender || "",
          region: c?.region ?? "Unknown",
          assignedProviderId: c?.assignedProviderId ? String(c.assignedProviderId) : "",
          bloodGroup: c?.bloodGroup ?? "",
          allergies: c?.allergies ?? "",
          lastCorrectionDate: safeToDateInput(c?.lastCorrectionDate),

          riskScore: typeof c?.riskScore === "number" ? c.riskScore : 0,
          isActive: typeof c?.isActive === "boolean" ? c.isActive : true,
          correctionApprovedBy: c?.correctionApprovedBy ? String(c.correctionApprovedBy) : "",
          createdAt: safeToDateInput(c?.createdAt),
          updatedAt: safeToDateInput(c?.updatedAt),
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

    if (!form.name?.trim() || !form.dateOfBirth || !form.gender) {
      showToast?.("Please fill required fields: Name, Date of Birth, Gender.", "danger");
      return;
    }

    setSaving(true);
    try {
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

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await api.updateChild(childId, payload);
      showToast?.("Child profile updated successfully!", "success");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast?.(e?.message || "Failed to update child.", "danger");
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
        <div className="text-sm text-gray-600">Loading child details…</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Child Name *" full>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
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

          <FormGroup label="Region">
            <Input value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Assigned Provider ID">
            <Input
              value={form.assignedProviderId}
              onChange={(e) => setForm((p) => ({ ...p, assignedProviderId: e.target.value }))}
            />
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
            <Input value={form.allergies} onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} />
          </FormGroup>

          <FormGroup label="Last Correction Date">
            <Input type="date" value={form.lastCorrectionDate} onChange={(e) => setForm((p) => ({ ...p, lastCorrectionDate: e.target.value }))} />
          </FormGroup>

          <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Backend-managed fields</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="text-gray-500">riskScore</div>
              <div className="font-semibold">{form.riskScore}</div>

              <div className="text-gray-500">isActive</div>
              <div className="font-semibold">{String(form.isActive)}</div>

              <div className="text-gray-500">correctionApprovedBy</div>
              <div className="font-semibold break-all">{form.correctionApprovedBy || "—"}</div>

              <div className="text-gray-500">createdAt</div>
              <div className="font-semibold">{form.createdAt || "—"}</div>

              <div className="text-gray-500">updatedAt</div>
              <div className="font-semibold">{form.updatedAt || "—"}</div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* Maps to use case: Send Notification Reminder */
export const SendReminderModal = ({ open, onClose, showToast }) => (
    <Modal open={open} onClose={onClose} title="Send Notification Reminder"
        footer={<>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { onClose(); showToast("Reminder sent to guardian", "success"); }}><Bell size={14} /> Send Reminder</Btn>
        </>}>
        <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Guardian" full><Select><option>Sarah Rana (Emma, Liam)</option><option>Bina Thapa (Aayush)</option><option>Anil Gurung (Priya)</option></Select></FormGroup>
            <FormGroup label="Regarding *" full><Select><option>Emma — Varicella (Overdue)</option><option>Aayush — MMR (Due Soon)</option><option>Liam — Hep B Booster (Upcoming)</option></Select></FormGroup>
            <FormGroup label="Channel"><Select><option>Email + SMS</option><option>Email only</option><option>SMS only</option></Select></FormGroup>
            <FormGroup label="Urgency"><Select><option>Standard</option><option>Urgent</option></Select></FormGroup>
            <FormGroup label="Message" full><Textarea defaultValue="This is a reminder that a vaccination is due. Please book an appointment at your earliest convenience." /></FormGroup>
        </div>
    </Modal>
);
