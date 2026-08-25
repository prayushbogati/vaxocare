import { useEffect, useMemo, useState } from "react";
import { api } from "../../apis";
import {
  Btn,
  Modal,
  Input,
  Select,
  Textarea,
  FormGroup,
  Table,
  Tr,
  Td,
  cn,
} from "./UI";

const emptyVaccine = {
  name: "",
  code: "",
  description: "",
  weeksAfterBirth: "",
  dosesRequired: "",
  doseIntervalWeeks: "",
  isCritical: false,
  applicableGenders: "",
  minimumAgeWeeks: "",
  maximumAgeWeeks: "",
  sideEffects: "",
  precautions: "",
};

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    return v.toLowerCase() === "true" || v === "1" || v.toLowerCase() === "yes";
  }
  return false;
};

const normalizeNumber = (v) => {
  if (v === "" || v === null || typeof v === "undefined") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const VaccinesSection = ({ showToast }) => {
  const [loading, setLoading] = useState(false);
  const [vaccines, setVaccines] = useState([]);

  const [includeInactive, setIncludeInactive] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyVaccine);
  const [selectedId, setSelectedId] = useState(null);

  const [seedBusy, setSeedBusy] = useState(false);

  const headers = useMemo(
    () => [
      "Name",
      "Code",
      "Weeks After Birth",
      "Doses Required",
      "Critical",
      "Actions",
    ],
    [],
  );

  const loadVaccines = async () => {
    setLoading(true);
    try {
      const res = await api.listVaccines(includeInactive);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.vaccines)
          ? res.vaccines
          : Array.isArray(res?.data)
            ? res.data
            : [];
      setVaccines(list);
    } catch (e) {
      showToast?.(e?.message || "Failed to load vaccines", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaccines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeInactive]);

  const openCreate = () => {
    setEditMode(false);
    setSelectedId(null);
    setForm({ ...emptyVaccine });
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditMode(true);
    setSelectedId(v?._id || v?.id);
    setForm({
      name: v?.name ?? "",
      code: v?.code ?? "",
      description: v?.description ?? "",
      weeksAfterBirth: v?.weeksAfterBirth ?? "",
      dosesRequired: v?.dosesRequired ?? "",
      doseIntervalWeeks: v?.doseIntervalWeeks ?? "",
      isCritical: toBool(v?.isCritical),
      applicableGenders: v?.applicableGenders ?? "",
      minimumAgeWeeks: v?.minimumAgeWeeks ?? "",
      maximumAgeWeeks: v?.maximumAgeWeeks ?? "",
      sideEffects: v?.sideEffects ?? "",
      precautions: v?.precautions ?? "",
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const payload = {
      name: form.name,
      code: form.code,
      description: form.description || undefined,
      weeksAfterBirth: normalizeNumber(form.weeksAfterBirth),
      dosesRequired: normalizeNumber(form.dosesRequired),
      doseIntervalWeeks: normalizeNumber(form.doseIntervalWeeks),
      isCritical: !!form.isCritical,
      applicableGenders: form.applicableGenders || undefined,
      minimumAgeWeeks: normalizeNumber(form.minimumAgeWeeks),
      maximumAgeWeeks: normalizeNumber(form.maximumAgeWeeks),
      sideEffects: form.sideEffects || undefined,
      precautions: form.precautions || undefined,
    };

    // basic required fields as per backend swagger: name, code, weeksAfterBirth
    if (!payload.name || !payload.code || typeof payload.weeksAfterBirth !== "number") {
      showToast?.("Please fill required fields: name, code, weeksAfterBirth", "warning");
      return;
    }

    try {
      setLoading(true);
      if (editMode) {
        await api.updateVaccine(selectedId, payload);
        showToast?.("Vaccine updated successfully", "success");
      } else {
        await api.createVaccine(payload);
        showToast?.("Vaccine created successfully", "success");
      }
      setModalOpen(false);
      await loadVaccines();
    } catch (e) {
      showToast?.(e?.message || "Failed to save vaccine", "danger");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (v) => {
    const id = v?._id || v?.id;
    if (!id) return;
    if (!window.confirm(`Delete vaccine "${v?.name || v?.code || id}"?`)) return;

    try {
      setLoading(true);
      await api.deleteVaccine(id);
      showToast?.("Vaccine deleted", "success");
      await loadVaccines();
    } catch (e) {
      showToast?.(e?.message || "Failed to delete vaccine", "danger");
    } finally {
      setLoading(false);
    }
  };

  const onSeed = async () => {
    try {
      setSeedBusy(true);
      await api.seedVaccines();
      showToast?.("Default vaccines seeded", "success");
      await loadVaccines();
    } catch (e) {
      showToast?.(e?.message || "Failed to seed vaccines", "danger");
    } finally {
      setSeedBusy(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vaccine Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the vaccine catalog used across the system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIncludeInactive((s) => !s)}
            className={cn(
              "px-3 py-2 text-sm rounded-lg border transition-colors cursor-pointer",
              includeInactive
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            {includeInactive ? "Including inactive" : "Active only"}
          </button>

          <Btn variant="outline" size="sm" onClick={onSeed} disabled={seedBusy}>
            {seedBusy ? "Seeding..." : "Seed defaults"}
          </Btn>
          <Btn variant="primary" size="sm" onClick={openCreate}>
            Add vaccine
          </Btn>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">
            Vaccines {loading ? "— Loading..." : ""}
          </h3>
          <div className="text-xs text-gray-500">
            Total: {vaccines.length}
          </div>
        </div>

        <div className="px-5 py-4">
          {vaccines.length === 0 ? (
            <div className="text-sm text-gray-500">
              {loading ? "Loading…" : "No vaccines found."}
            </div>
          ) : (
            <Table heads={headers}>
              {vaccines.map((v) => {
                const id = v?._id || v?.id;
                return (
                  <Tr key={id || `${v?.code}-${v?.name}`}>
                    <Td bold>{v?.name || "—"}</Td>
                    <Td>{v?.code || "—"}</Td>
                    <Td>{typeof v?.weeksAfterBirth === "number" ? v.weeksAfterBirth : v?.weeksAfterBirth ?? "—"}</Td>
                    <Td>{typeof v?.dosesRequired === "number" ? v.dosesRequired : v?.dosesRequired ?? "—"}</Td>
                    <Td>
                      {toBool(v?.isCritical) ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                          Critical
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Normal
                        </span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Btn variant="outline" size="sm" onClick={() => openEdit(v)}>
                          Edit
                        </Btn>
                        <Btn variant="danger" size="sm" onClick={() => onDelete(v)}>
                          Delete
                        </Btn>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMode ? "Edit Vaccine" : "Add New Vaccine"}
        wide
        footer={
          <>
            <Btn variant="ghost" onClick={() => setModalOpen(false)} disabled={loading}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={submit} disabled={loading}>
              {loading ? "Saving..." : editMode ? "Save Changes" : "Create Vaccine"}
            </Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Name *">
            <Input
              placeholder="e.g. DPT 1"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </FormGroup>

          <FormGroup label="Code *">
            <Input
              placeholder="e.g. DPT-1"
              value={form.code}
              onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
            />
          </FormGroup>

          <FormGroup label="Weeks After Birth *">
            <Input
              placeholder="e.g. 6"
              value={form.weeksAfterBirth}
              onChange={(e) => setForm((s) => ({ ...s, weeksAfterBirth: e.target.value }))}
            />
          </FormGroup>

          <FormGroup label="Doses Required">
            <Input
              placeholder="e.g. 1"
              value={form.dosesRequired}
              onChange={(e) => setForm((s) => ({ ...s, dosesRequired: e.target.value }))}
            />
          </FormGroup>

          <FormGroup label="Dose Interval Weeks">
            <Input
              placeholder="e.g. 4"
              value={form.doseIntervalWeeks}
              onChange={(e) =>
                setForm((s) => ({ ...s, doseIntervalWeeks: e.target.value }))
              }
            />
          </FormGroup>

          <FormGroup label="Is Critical">
            <Select
              value={form.isCritical ? "true" : "false"}
              onChange={(e) => setForm((s) => ({ ...s, isCritical: e.target.value === "true" }))}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Select>
          </FormGroup>

          <FormGroup label="Applicable Genders">
            <Input
              placeholder="e.g. male,female or both"
              value={form.applicableGenders}
              onChange={(e) =>
                setForm((s) => ({ ...s, applicableGenders: e.target.value }))
              }
            />
          </FormGroup>

          <FormGroup label="Minimum Age Weeks">
            <Input
              placeholder="e.g. 0"
              value={form.minimumAgeWeeks}
              onChange={(e) =>
                setForm((s) => ({ ...s, minimumAgeWeeks: e.target.value }))
              }
            />
          </FormGroup>

          <FormGroup label="Maximum Age Weeks">
            <Input
              placeholder="e.g. 52"
              value={form.maximumAgeWeeks}
              onChange={(e) =>
                setForm((s) => ({ ...s, maximumAgeWeeks: e.target.value }))
              }
            />
          </FormGroup>

          <FormGroup label="Side Effects">
            <Textarea
              placeholder="Optional side effects description"
              value={form.sideEffects}
              onChange={(e) =>
                setForm((s) => ({ ...s, sideEffects: e.target.value }))
              }
            />
          </FormGroup>

          <FormGroup label="Precautions" full>
            <Textarea
              placeholder="Optional precautions"
              value={form.precautions}
              onChange={(e) =>
                setForm((s) => ({ ...s, precautions: e.target.value }))
              }
            />
          </FormGroup>

          <FormGroup label="Description" full>
            <Textarea
              placeholder="Optional long description"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
            />
          </FormGroup>
        </div>
      </Modal>
    </div>
  );
};

export default VaccinesSection;
