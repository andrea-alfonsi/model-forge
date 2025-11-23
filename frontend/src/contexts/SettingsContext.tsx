import React, { createContext, useContext, useState, useCallback } from 'react';


export interface AppSettings {
  
}

// Define the shape of the Context object
export interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <T extends keyof AppSettings>(key: T, value: AppSettings[T]) => void;
  resetSettings: () => void;
}


const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'en',
  sidebarCollapsed: false,
  itemsPerPage: 10,
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const updateSetting = useCallback(<T extends keyof AppSettings>(key: T, value: AppSettings[T]) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const contextValue: SettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};