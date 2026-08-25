import { useEffect, useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { api } from "../../apis";
import { Btn, Input, cn, FormGroup } from "./UI";

const SystemSettingsSection = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [configs, setConfigs] = useState([]); // backend returns array
  const [drafts, setDrafts] = useState({}); // key -> value (string/boolean/number)
  const [resetting, setResetting] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.adminConfigAll();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setConfigs(list);
      const nextDrafts = {};
      for (const c of list) nextDrafts[c.key] = c.value;
      setDrafts(nextDrafts);
    } catch (e) {
      showToast(e?.message || "Failed to load system configurations", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keys = useMemo(() => configs.map((c) => c.key), [configs]);

  const coerceValueForSave = (key, raw, currentValue) => {
    // Backend validates by DEFAULT_CONFIG types. We'll coerce based on currentValue type.
    if (typeof currentValue === "number") {
      const n = Number(raw);
      return Number.isFinite(n) ? n : raw;
    }
    if (typeof currentValue === "boolean") {
      if (typeof raw === "boolean") return raw;
      if (raw === "true" || raw === true) return true;
      if (raw === "false" || raw === false) return false;
      return raw;
    }
    return raw;
  };

  const onSaveKey = async (key) => {
    const current = configs.find((c) => c.key === key);
    const currentValue = current?.value;
    const raw = drafts[key];

    setSavingKey(key);
    try {
      const value = coerceValueForSave(key, raw, currentValue);
      await api.adminUpdateConfig(key, { value });
      showToast(`Updated ${key}`, "success");
      await load();
    } catch (e) {
      showToast(e?.message || `Failed to update ${key}`, "danger");
    } finally {
      setSavingKey(null);
    }
  };

  const onResetDefaults = async () => {
    setResetting(true);
    try {
      await api.adminResetConfigs();
      showToast("Configurations reset to default", "success");
      await load();
    } catch (e) {
      showToast(e?.message || "Failed to reset configurations", "danger");
    } finally {
      setResetting(false);
    }
  };

  const onInitializeDefaults = async () => {
    setInitializing(true);
    try {
      await api.adminInitializeConfigs();
      showToast("Default configurations initialized", "success");
      await load();
    } catch (e) {
      showToast(e?.message || "Failed to initialize configurations", "danger");
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage backend system configuration (value updates + reset).
        </p>
      </div>

      <div className="mb-5 flex gap-3 flex-wrap items-center">
        <Btn
          variant="outline"
          onClick={onInitializeDefaults}
          disabled={loading || initializing || resetting}
        >
          {initializing ? "Initializing…" : "Initialize defaults"}
        </Btn>
        <Btn
          variant="danger"
          onClick={onResetDefaults}
          disabled={loading || resetting || initializing}
        >
          {resetting ? "Resetting…" : "Reset to defaults"}
        </Btn>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <Settings size={15} className="text-blue-700" />
          <h3 className="text-sm font-bold text-gray-800">Configurations</h3>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : keys.length === 0 ? (
            <div className="text-sm text-gray-500">No configurations found.</div>
          ) : (
            <div className="space-y-4">
              {configs.map((c) => {
                const draft = drafts[c.key];
                const valueType = typeof c.value;
                const inputType =
                  valueType === "number"
                    ? "number"
                    : valueType === "boolean"
                      ? "text"
                      : "text";

                return (
                  <div
                    key={c.key}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-[220px] flex-1">
                        <p className="text-sm font-semibold text-gray-800 break-all">
                          {c.key}
                        </p>
                        {c.description ? (
                          <p className="text-xs text-gray-500 mt-1">
                            {c.description}
                          </p>
                        ) : null}
                        <p className="text-xs text-gray-400 mt-2">
                          Type: <span className="font-medium">{valueType}</span>
                        </p>
                      </div>

                      <div className="w-full sm:w-[320px]">
                        <FormGroup label="Value">
                          {valueType === "boolean" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setDrafts((d) => ({ ...d, [c.key]: true }))
                                }
                                className={cn(
                                  "px-3 py-2 rounded-lg text-sm font-semibold border",
                                  draft === true
                                    ? "bg-blue-100 border-blue-200 text-blue-800"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
                                )}
                              >
                                True
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDrafts((d) => ({ ...d, [c.key]: false }))
                                }
                                className={cn(
                                  "px-3 py-2 rounded-lg text-sm font-semibold border",
                                  draft === false
                                    ? "bg-blue-100 border-blue-200 text-blue-800"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
                                )}
                              >
                                False
                              </button>
                            </div>
                          ) : (
                            <Input
                              type={inputType}
                              value={draft ?? ""}
                              onChange={(e) =>
                                setDrafts((d) => ({
                                  ...d,
                                  [c.key]:
                                    valueType === "number"
                                      ? e.target.value
                                      : e.target.value,
                                }))
                              }
                            />
                          )}
                        </FormGroup>
                      </div>

                      <div className="flex items-end">
                        <Btn
                          variant="primary"
                          onClick={() => onSaveKey(c.key)}
                          disabled={savingKey === c.key}
                        >
                          {savingKey === c.key ? "Saving…" : "Save"}
                        </Btn>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsSection;
