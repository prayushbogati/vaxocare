import { useState, useEffect } from "react";
import { X, Check, Info, AlertTriangle } from "lucide-react";

export const cn = (...c) => c.filter(Boolean).join(" ");

/* ─── Badge ─── */
export const Badge = ({ color, children }) => {
    const map = {
        green: "bg-green-100 text-green-700",
        yellow: "bg-yellow-100 text-yellow-700",
        red: "bg-red-100 text-red-600",
        blue: "bg-blue-100 text-blue-700",
        gray: "bg-gray-100 text-gray-600",
        purple: "bg-purple-100 text-purple-700",
        orange: "bg-orange-100 text-orange-600",
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
    const styles = {
        success: "bg-green-700",
        danger: "bg-red-600",
        info: "bg-blue-700",
        warning: "bg-yellow-600",
        default: "bg-gray-800",
    };
    return (
        <div className={cn("fixed bottom-5 right-5 z-50 flex items-center gap-2.5 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl max-w-xs", styles[toast.type] || styles.default)}>
            {toast.type === "success" && <Check size={16} />}
            {toast.type === "danger" && <X size={16} />}
            {toast.type === "info" && <Info size={16} />}
            {toast.type === "warning" && <AlertTriangle size={16} />}
            {toast.msg}
        </div>
    );
};

/* ─── Modal ─── */
export const Modal = ({ open, onClose, title, children, footer, wide }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={cn("bg-white rounded-2xl w-full max-h-[90vh] flex flex-col shadow-2xl", wide ? "max-w-2xl" : "max-w-lg")}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <h2 className="text-base font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <X size={15} className="text-gray-500" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                        {footer}
                    </div>
                )}
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
    <input {...props} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400" />
);

export const Select = ({ children, ...props }) => (
    <select {...props} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer appearance-none">
        {children}
    </select>
);

export const Textarea = (props) => (
    <textarea {...props} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y min-h-[80px] placeholder-gray-400" />
);

/* ─── Btn ─── */
export const Btn = ({ variant = "primary", size = "md", className = "", children, ...props }) => {
    const base = "inline-flex items-center gap-2 font-semibold rounded-lg transition-all cursor-pointer border-0 outline-none whitespace-nowrap";
    const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
    const variants = {
        primary: "bg-blue-700 text-white hover:bg-blue-800 active:scale-95",
        outline: "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 hover:border-blue-500",
        ghost: "bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        purple: "bg-purple-700 text-white hover:bg-purple-800",
    };
    return (
        <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
            {children}
        </button>
    );
};

/* ─── StatCard ─── */
export const StatCard = ({ icon: Icon, iconColor, value, label, sub, trend }) => {
    const colors = {
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        yellow: "bg-yellow-100 text-yellow-600",
        orange: "bg-orange-100 text-orange-600",
        purple: "bg-purple-100 text-purple-700",
        red: "bg-red-100 text-red-600",
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colors[iconColor])}>
                <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800 leading-tight mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
            {trend !== undefined && (
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-1", trend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                    {trend >= 0 ? `+${trend}%` : `${trend}%`}
                </span>
            )}
        </div>
    );
};

/* ─── ProgressBar ─── */
export const ProgressBar = ({ pct, color = "blue" }) => {
    const colors = {
        blue: "from-blue-600 to-blue-400",
        green: "from-green-500 to-green-400",
        red: "from-red-500 to-red-400",
        yellow: "from-yellow-500 to-yellow-400",
        purple: "from-purple-500 to-purple-400",
    };
    return (
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
                className={cn("h-full bg-linear-to-r rounded-full transition-all duration-500", colors[color])}
                style={{ width: `${Math.min(pct, 100)}%` }}
            />
        </div>
    );
};

/* ─── Toggle ─── */
export const Toggle = ({ defaultOn = false, onChange }) => {
    const [on, setOn] = useState(defaultOn);
    const handle = () => { setOn(!on); onChange?.(!on); };
    return (
        <button onClick={handle} className={cn("relative w-11 h-6 rounded-full transition-colors shrink-0", on ? "bg-blue-600" : "bg-gray-300")}>
            <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all", on ? "left-[22px]" : "left-0.5")} />
        </button>
    );
};

/* ─── Avatar ─── */
export const Avatar = ({ name, size = "sm" }) => {
    const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
    const palette = ["bg-blue-600", "bg-purple-600", "bg-green-600", "bg-orange-500", "bg-red-500", "bg-teal-600", "bg-pink-600", "bg-indigo-600"];
    const bg = palette[(name?.charCodeAt(0) || 0) % palette.length];
    const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
    return (
        <div className={cn("rounded-full flex items-center justify-center text-white font-bold shrink-0", bg, sz[size])}>
            {initials}
        </div>
    );
};

/* ─── Table helpers ─── */
export const Table = ({ heads, children }) => (
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead>
                <tr className="border-b border-gray-200">
                    {heads.map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">{children}</tbody>
        </table>
    </div>
);

export const Tr = ({ children, onClick }) => (
    <tr onClick={onClick} className={cn("hover:bg-gray-50 transition-colors", onClick && "cursor-pointer")}>
        {children}
    </tr>
);

export const Td = ({ children, bold, gray, className }) => (
    <td className={cn("px-4 py-3 text-sm whitespace-nowrap", bold ? "font-semibold text-gray-800" : gray ? "text-gray-400" : "text-gray-600", className)}>
        {children}
    </td>
);