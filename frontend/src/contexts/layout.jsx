import { useContext, createContext } from "react";

const LayoutContext = createContext();

export const LayoutProvider = LayoutContext.Provider
export const useLayout = () => useContext(LayoutContext)