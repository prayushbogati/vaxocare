import React from "react";
import logo from "../assets/images/logoLight.png";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { UseHeaderContext } from "../Hooks/UseHeaderContext";
import { Bell } from "lucide-react";
import { api, auth } from "../apis";

const Header = () => {
    const token = localStorage.getItem("token");
    const isLoggedIn = Boolean(token);
    const [userInitials, setUserInitials] = useState("SR");

    const NAV_LINKS = [
        "Home",
        "About",
        ...(token ? ["Dashboard"] : []),
        "Contact",
        ...(token ? ["Logout"] : ["Login"]),
    ];

    const [hovered, setHovered] = useState(null);
    const [open, setOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            if (!token) {
                setUserInitials("SR");
                return;
            }
            try {
                const res = await api.me();
                const data = res?.data ?? res ?? {};
                const fullName =
                    data?.name ||
                    data?.fullName ||
                    [data?.firstName, data?.lastName].filter(Boolean).join(" ") ||
                    "";

                const initials = fullName
                    ? fullName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase())
                        .join("")
                    : "SR";

                if (mounted) setUserInitials(initials || "SR");
            } catch {
                if (mounted) setUserInitials("SR");
            }
        };

        run();

        return () => {
            mounted = false;
        };
    }, [token]);

    const role = auth.getRole?.() || localStorage.getItem("role") || null;
    const getRoleDashboardPath = () => {
        if (role === "admin") return "/adminDashboard";
        if (role === "provider") return "/orgDashboard";
        return "/dashboard";
    };

    const { active, setActive, switchView, showModal, sidebarOpen, setSidebarOpen, setView, setModel } = UseHeaderContext();

    const getPage = (link) => {
        if (link === "Home") return "/";
        if (link === "About") return "/about";
        if (link === "Contact") return "/contact";
        if (link === "Dashboard") return "/dashboard";
        if (link === "Login") return "/login";
        if (link === "Logout") return "/login";
        return "/";
    };

    const handleLogout = async () => {
        const ok = window.confirm("Are you sure you want to logout?");
        if (!ok) return;

        try {
            await api.logout();
        } catch {
            // ignore
        }

        auth.clearToken();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const p = location.pathname;

        if (!token) {
            if (p === "/login") setActive("Login");
            else setActive("Home");
            return;
        }

        if (p === "/dashboard" || p === "/orgDashboard" || p === "/adminDashboard") {
            setActive("Dashboard");
            return;
        }

        if (p === "/contact") setActive("Contact");
        else if (p === "/about") setActive("About");
        else if (p === "/") setActive("Home");
        else if (p === "/login") setActive("Logout");
    }, [location.pathname, setActive, token]);

    useEffect(() => {
        let cancelled = false;

        const parseDateMs = (d) => {
            if (!d) return null;
            const t = new Date(d).getTime();
            return Number.isNaN(t) ? null : t;
        };

        const computeHasUnread = async () => {
            if (!token) {
                if (!cancelled) setHasUnread(false);
                return;
            }

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

                const derived = [];

                const childName = (childId) => {
                    const c = children.find((x) => (x?._id || x?.id) === childId);
                    return c?.name || c?.fullName || c?.firstName || "Child";
                };

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
                                key: `${cid}-${v?._id || v?.id}-overdue-${vaccineName}`,
                                title: `${childName(cid)}'s ${vaccineName} is overdue`,
                            });
                            continue;
                        }

                        const dueInRange = dueMs !== null && dueMs >= now && dueMs <= now + dueSoonMs;
                        if (dueInRange) {
                            derived.push({
                                type: "warn",
                                key: `${cid}-${v?._id || v?.id}-dueSoon-${vaccineName}`,
                                title: `Reminder: ${childName(cid)} – ${vaccineName}`,
                            });
                            continue;
                        }

                        if (lastReminderMs !== null && lastReminderMs >= now - 30 * 24 * 60 * 60 * 1000) {
                            derived.push({
                                type: "info",
                                key: `${cid}-${v?._id || v?.id}-reminder-${vaccineName}`,
                                title: `Reminder update: ${childName(cid)} – ${vaccineName}`,
                            });
                        }
                    }
                }

                if (!cancelled) setHasUnread(derived.length > 0);
            } catch {
                if (!cancelled) setHasUnread(false);
            }
        };

        computeHasUnread();

        return () => {
            cancelled = true;
        };
    }, [token]);

    return (
        <header className="w-full bg-blue-800 shadow-lg">
            <div
                className={`max-w-7xl mx-auto px-6 py-4 flex ${open && "max-sm:flex-col"
                    } items-center justify-between gap-5`}
            >
                <Link
                    to="/"
                    className="flex items-center gap-2 group"
                    onClick={() => setActive("Home")}
                >
                    <div className="w-20 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <img src={logo} alt="logo" />
                    </div>
                </Link>

                <button className={`sm:hidden ${open && "hidden"}`}>
                    <MenuIcon className="text-white" onClick={() => setOpen(!open)} />
                </button>

                <nav
                    className={`${open ? "max-sm:flex max-sm:flex-col" : "max-sm:hidden"
                        } md:flex md:flex-row items-center justify-center gap-1`}
                >
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link}
                            to={getPage(link)}
                            onClick={async (e) => {
                                setActive(link);
                                if (link === "Logout") {
                                    e.preventDefault();
                                    await handleLogout();
                                }
                            }}
                            onMouseEnter={() => setHovered(link)}
                            onMouseLeave={() => setHovered(null)}
                            className={`
                relative px-4 py-2 rounded-md text-sm font-medium tracking-wide
                transition-all duration-200 ease-out
                ${active === link
                                    ? "text-white bg-blue-600"
                                    : "text-blue-200 hover:text-white hover:bg-blue-700"
                                }
              `}
                        >
                            {link}
                            <span
                                className={`
                  absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-white rounded-full
                  transition-all duration-300 ease-out
                  ${active === link
                                        ? "w-4 opacity-100"
                                        : hovered === link
                                            ? "w-3 opacity-50"
                                            : "w-0 opacity-0"
                                    }
                `}
                            />
                        </Link>
                    ))}

                    {isLoggedIn && (
                        <>
                            <button
                                onClick={() =>
                                    navigate(`${getRoleDashboardPath()}?action=notif`)
                                }
                                className="relative w-9 h-9 rounded-full bg-blue-700 hover:bg-blue-600 flex items-center justify-center text-white transition-colors cursor-pointer border-0"
                            >
                                <Bell size={17} />
                                {hasUnread && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-blue-800" />
                                )}
                            </button>

                            <button
                                onClick={() =>
                                    navigate(`${getRoleDashboardPath()}?action=profile`)
                                }
                                className="w-9 h-9 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
                                aria-label="Open profile"
                            >
                                {userInitials}
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
