import { useEffect } from "react";
import { Check, X, Info } from "lucide-react";

/* ─── tiny helpers ─── */
export const cn = (...c) => c.filter(Boolean).join(" ");

export const Badge = ({ color, children }) => {
    const map = {
        green: "bg-emerald-100 text-emerald-700",
        yellow: "bg-amber-100 text-amber-700",
        red: "bg-red-100 text-red-600",
        blue: "bg-sky-100 text-sky-700",
        gray: "bg-gray-100 text-gray-600",
        purple: "bg-violet-100 text-violet-700",
    };
    return (
        <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", map[color])}>
            {children}
        </span>
    );
};

/* ─── Toast ─── */
export const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast, onClose]);
    if (!toast) return null;
    const styles = { success: "bg-emerald-700", danger: "bg-red-600", info: "bg-sky-700", default: "bg-gray-800" };
    return (
        <div className={cn("fixed bottom-5 right-5 z-50 flex items-center gap-2.5 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl transition-all", styles[toast.type] || styles.default)}>
            {toast.type === "success" && <Check size={16} />}
            {toast.type === "danger" && <X size={16} />}
            {toast.type === "info" && <Info size={16} />}
            {toast.msg}
        </div>
    );
};

/* ─── Modal ─── */
export const Modal = ({ open, onClose, title, children, footer }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <h2 className="text-base font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <X size={15} className="text-gray-500" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
                {footer && <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">{footer}</div>}
            </div>
        </div>
    );
};

/* ─── Form helpers ─── */
export const FormGroup = ({ label, full, children, hint }) => (
    <div className={cn("flex flex-col gap-1.5", full && "col-span-2")}>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
        {children}
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
);
export const Input = (props) => (
    <input {...props} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder-gray-400" />
);
export const Select = ({ children, ...props }) => (
    <select {...props} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer appearance-none">
        {children}
    </select>
);
export const Textarea = (props) => (
    <textarea {...props} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-y min-h-[80px] placeholder-gray-400" />
);

/* ─── Buttons ─── */
export const Btn = ({ variant = "primary", size = "md", className = "", children, ...props }) => {
    const base = "inline-flex items-center gap-2 font-semibold rounded-lg transition-all cursor-pointer border-0 outline-none";
    const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
    const variants = {
        primary: "bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95",
        outline: "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 hover:border-emerald-500",
        ghost: "bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
        success: "bg-emerald-600 text-white hover:bg-emerald-700",
    };
    return (
        <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
            {children}
        </button>
    );
};

/* ─── Stat Card ─── */
export const StatCard = ({ icon: Icon, iconColor, value, label, sub }) => {
    const colors = {
        green: "bg-emerald-100 text-emerald-700",
        yellow: "bg-amber-100 text-amber-600",
        red: "bg-red-100 text-red-600",
        blue: "bg-sky-100 text-sky-700",
        purple: "bg-violet-100 text-violet-700",
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colors[iconColor])}>
                <Icon size={22} />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800 leading-tight mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
};

/* ─── Progress Bar ─── */
export const ProgressBar = ({ pct, color = "emerald" }) => (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mt-2">
        <div className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r", color === "emerald" ? "from-emerald-600 to-emerald-400" : "from-sky-600 to-sky-400")} style={{ width: `${pct}%` }} />
    </div>
);