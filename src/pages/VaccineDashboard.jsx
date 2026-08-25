import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api, auth } from "../apis/index.jsx";
import Sidebar from "../components/parentDashboardComponents/Sidebar";
import DashboardOverview from "../components/parentDashboardComponents/DashboardOverview";
import ChildrenSection from "../components/parentDashboardComponents/ChildrenSection";
import AppointmentsSection from "../components/parentDashboardComponents/AppointmentsSection";
import VaccineRecordsSection from "../components/parentDashboardComponents/VaccineRecordsSection";
import ProfileSection from "../components/parentDashboardComponents/ProfileSection";
import SettingsSection from "../components/parentDashboardComponents/SettingsSection";
import {
    RegisterChildModal,
    BookApptModal,
    EditApptModal,
    EditChildModal,
    EditProfileModal,
    NotifModal,
    VaccinationReportModal,
} from "../components/parentDashboardComponents/Modals";
import { Toast } from "../components/parentDashboardComponents/UI";
import { UseHeaderContext } from "../Hooks/UseHeaderContext";

const VaccineDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        sidebarOpen,
        setSidebarOpen,
        view,
        setView,
        modal,
        setModal,
        toast,
        setToast,
        switchView,
        showModal,
        closeModal,
        showToast,
        modalData,
    } = UseHeaderContext();

    const [childrenRefreshKey, setChildrenRefreshKey] = useState(0);

    const sectionProps = { setView: switchView, showModal, showToast };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const action = params.get("action");

        if (!action) return;

        if (action === "notif") {
            setModal("notif");
        } else if (action === "profile") {
            switchView("profile");
        }

        // Prevent the modal/view from immediately re-opening after user closes it.
        // Keep the URL clean by removing the action query param.
        params.delete("action");
        const newSearch = params.toString();
        navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
    }, [location.search, location.pathname, navigate, setModal, switchView]);

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch {
            // ignore API failures; still clear local session
        } finally {
            auth.clearToken();
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    view={view}
                    switchView={switchView}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    onLogout={handleLogout}
                />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {view === "dashboard" && <DashboardOverview {...sectionProps} />}
                    {view === "children" && <ChildrenSection {...sectionProps} refreshKey={childrenRefreshKey} />}
                    {view === "appointments" && <AppointmentsSection {...sectionProps} />}
                    {view === "vaccines" && <VaccineRecordsSection {...sectionProps} />}
                    {view === "profile" && <ProfileSection {...sectionProps} />}
                    {view === "settings" && <SettingsSection {...sectionProps} />}
                </main>
            </div>

            {/* Modals */}
            <RegisterChildModal
                open={modal === "register"}
                onClose={closeModal}
                showToast={showToast}
                onCreated={() => setChildrenRefreshKey((k) => k + 1)}
            />
            <BookApptModal
                open={modal === "appt"}
                onClose={closeModal}
                showToast={showToast}
                defaultChildId={modalData?.childId || ""}
            />
            <EditApptModal open={modal === "editAppt"} onClose={closeModal} showToast={showToast} />
            <EditChildModal
                open={modal === "editChild"}
                onClose={closeModal}
                showToast={showToast}
                childId={modalData?.childId || null}
                onSaved={() => setChildrenRefreshKey((k) => k + 1)}
            />
            <EditProfileModal open={modal === "editProfile"} onClose={closeModal} showToast={showToast} />
            <VaccinationReportModal
                open={modal === "vaccinationReport"}
                onClose={closeModal}
                showToast={showToast}
                vaccination={modalData?.vaccination || null}
                childLabel={modalData?.childLabel || null}
            />
            <NotifModal open={modal === "notif"} onClose={closeModal} />

            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

export default VaccineDashboard;