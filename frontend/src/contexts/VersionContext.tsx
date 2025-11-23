import React, { createContext, useContext, useState, useMemo } from 'react';

// 1. Get the version list from Vite's env variables
//    We provide a fallback ('v1.0') in case it's not defined.
const versionsString = import.meta.env.VITE_APP_VERSIONS || '1.0';
const availableVersions = versionsString.split(',');

// 2. Set the default version to be the first one in the list
const defaultVersion = availableVersions[0];

// 3. Create the context
const VersionContext = createContext< { currentVersion: string, setVersion: (newVersion: string) => void, availableVersions: string[] } | null >(null);

// 4. Create the Provider component
export const VersionProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentVersion, setCurrentVersion] = useState(defaultVersion);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentVersion,
    setVersion: setCurrentVersion, // Expose the setter function
    availableVersions,
  }), [currentVersion]); // Only recalculate when currentVersion changes

  return (
    <VersionContext.Provider value={value}>
      {children}
    </VersionContext.Provider>
  );
};

// 5. Create a custom hook for easy consumption
export const useVersion = () => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};