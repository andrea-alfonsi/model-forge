
import React, { createContext, useContext, useState } from "react"
import { useLayout } from "./contexts/layout";

const AlertTriangleIcon = ({ className = "w-5 h-5" }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);


const WarningAlert = ({ children }) => {
    const { isSidebarOpen } = useLayout()
    return (
        <div 
            className={`mt-6 p-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg flex items-start ${ isSidebarOpen ? 'w-full space-x-3' : 'w-full'}`}
            role="alert"
        >
            {/* Replaced AlertTriangle with AlertTriangleIcon */}
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
            
            <p className="text-sm font-medium">
                {isSidebarOpen ? children: ''}
            </p>
        </div>
    );
};

export default function Sidebar({ children }) {
    const { isSidebarOpen } = useLayout();

  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-16';

  return (
    <aside
      className={`h-full bg-white pt-4 shadow-xl flex-shrink-0 transition-all duration-300 border-r border-gray-200 ${sidebarWidth}`}
    >
      <nav className="h-full flex flex-col">
        <ul className="flex-1 px-3">
          {children}
          <WarningAlert>
            You're in the deep end! This is the Alpha version. If you see something change unexpectedly, just remember: we're building the plane while flying it. Your feedback is gold!
          </WarningAlert>
        </ul>
        <div className="p-3 border-t border-gray-100">
          <div className={`flex items-center text-gray-500 transition-all duration-300 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700">
              U
            </div>
            <span className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? "w-40 ml-3 text-sm" : "w-0"}`}>
              User Profile
            </span>
          </div>
        </div>
      </nav>
    </aside>
  );
}

export const SidebarItem = ({ icon, text, active, onClick }) => {
  const { isSidebarOpen } = useLayout();
  const baseClasses = "relative flex items-center py-2 px-3 my-1 font-medium rounded-xl cursor-pointer transition-all duration-300 ";
  const activeClasses = active
    ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
    : "hover:bg-indigo-50 text-gray-600 hover:text-indigo-600";

  return (
    <li className={baseClasses + activeClasses} onClick={onClick}>
      {React.cloneElement(icon, { className: "w-5 h-5" })}
      <span
        className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? "w-44 ml-3" : "w-0"}`}
      >
        {text}
      </span>
      {/* Tooltip for collapsed state */}
      {!isSidebarOpen && (
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap">
          {text}
        </div>
      )}
    </li>
  );
};