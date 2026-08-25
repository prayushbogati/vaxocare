import { useEffect, useMemo, useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { api } from "../../apis";
import { Btn, FormGroup, Select } from "./UI";

const ProviderSection = ({ showToast }) => {
    const [providers, setProviders] = useState([]);
    const [selectedProviderId, setSelectedProviderId] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const [listRes, selRes] = await Promise.all([
                    api.listProvidersForParent(),
                    api.getSelectedProvider(),
                ]);

                const list = listRes?.data ?? listRes ?? [];
                const sel = selRes?.providerId || "";

                if (!mounted) return;
                setProviders(Array.isArray(list) ? list : []);
                setSelectedProviderId(sel || "");
            } catch (e) {
                showToast?.(e?.message || "Failed to load providers", "danger");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [showToast]);

    const providerOptions = useMemo(() => {
        return (providers || []).map((p) => {
            const id = p?._id || p?.id;
            const label = p?.username || p?.email || p?.name || p?.fullName || "Provider";
            return { id, label };
        });
    }, [providers]);

    const selectedLabel = useMemo(() => {
        const p = providers.find((x) => (x?._id || x?.id) === selectedProviderId);
        return p?.username || p?.email || p?.name || p?.fullName || "—";
    }, [providers, selectedProviderId]);

    const handleSave = async () => {
        try {
            if (!selectedProviderId) {
                showToast?.("Please select a provider.", "warning");
                return;
            }
            await api.setSelectedProvider(selectedProviderId);
            showToast?.(`Provider selected: ${selectedLabel}`, "success");
        } catch (e) {
            showToast?.(e?.message || "Failed to save provider selection", "danger");
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Provider</h1>
                <p className="text-sm text-gray-500 mt-1">Choose which provider’s schedule you want to view.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
                <div className="px-5 py-3.5 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">Selected Provider</h3>
                </div>

                <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <User size={16} className="text-blue-700" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{selectedLabel}</p>
                            <p className="text-xs text-gray-500 mt-0.5">This will be used to scope child/vaccine data.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <FormGroup label="Provider" full>
                            <Select
                                value={selectedProviderId}
                                onChange={(e) => setSelectedProviderId(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">{loading ? "Loading…" : "Select provider"}</option>
                                {providerOptions.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.label}
                                    </option>
                                ))}
                            </Select>
                        </FormGroup>

                        <Btn variant="primary" onClick={handleSave} disabled={loading}>
                            Save Provider
                        </Btn>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderSection;

