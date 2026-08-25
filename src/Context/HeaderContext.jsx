import { useState, createContext } from "react";

export const HeaderContext = createContext()

export const HeaderContextProvider = ({ children }) => {
    const [active, setActive] = useState("Home"); //for nav links focus

    // for parent dashboard
    // for states
    const [view, setView] = useState("dashboard");
    const [modal, setModal] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);
    // for methods
    const switchView = (v) => {
        setView(v);
        setSidebarOpen(false);
    };
    const showModal = (id, data = null) => {
        setModal(id);
        setModalData(data);
    };
    const closeModal = () => {
        setModal(null);
        setModalData(null);
    };
    const showToast = (msg, type = "info") => setToast({ msg, type });

    return (
        <HeaderContext.Provider value={{
            active,
            setActive,
            sidebarOpen,
            setSidebarOpen,
            modal,
            setModal,
            view,
            setView,
            toast,
            setToast,
            switchView,
            showModal,
            closeModal,
            modalData,
            setModalData,
            showToast
        }}>
            {children}
        </HeaderContext.Provider>
    )

}
