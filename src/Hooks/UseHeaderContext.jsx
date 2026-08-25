import { useContext } from "react";
import { HeaderContext } from "../Context/HeaderContext";

export const UseHeaderContext = () => {
    const context = useContext(HeaderContext)

    if (!context) {
        throw Error("UseHeaderContext is only available inside HeaderContextProvider")
    }

    return context
} 