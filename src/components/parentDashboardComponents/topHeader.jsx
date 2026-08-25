import { Menu, Syringe, Bell } from "lucide-react";

const TopHeader = ({ switchView, showModal, sidebarOpen, setSidebarOpen }) => {
    return (
        <header className="bg-blue-800 h-16 px-5 flex items-center justify-between shadow-lg sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <button className="lg:hidden text-white mr-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu size={22} />
                </button>
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                    <Syringe size={18} className="text-blue-800" />
                </div>
                <span className="text-white font-bold text-lg">
                    Vacci<span className="text-blue-300">Care</span>
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => showModal("notif")}
                    className="hidden sm:flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer border-0"
                >
                    <Bell size={13} /> Reminders
                </button>
                <button
                    onClick={() => showModal("notif")}
                    className="relative w-9 h-9 rounded-full bg-blue-700 hover:bg-blue-600 flex items-center justify-center text-white transition-colors cursor-pointer border-0"
                >
                    <Bell size={17} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-blue-800" />
                </button>
                <button
                    onClick={() => switchView("profile")}
                    className="w-9 h-9 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
                >
                    SR
                </button>
            </div>
        </header>
    );
};

export default TopHeader;