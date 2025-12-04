import SidebarNav from "@/components/settings-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface UserSettings {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  verifyPassword?: string;
}

interface ThemeSettings {
  theme: string;
  availableThemes: string[];
}


const navItems = [
    { name: 'Profile', href: '#profile' },
    { name: 'Theme', href: '#theme' },
    { name: 'Members', href: '#members' },
    { name: 'Billing', href: '#billing' },
    { name: 'Invoices', href: '#invoices' },
    { name: 'API', href: '#api' },
  ];



const Profile: React.FC<{ settings: UserSettings; setSettings: React.Dispatch<React.SetStateAction<UserSettings>> }> = ({ settings, setSettings }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving basic info:", settings);
    // In a real app, you'd send this data to an API
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-0.5">
        <h3 className="text-xl font-semibold tracking-tight" id="profile">Profile</h3>
        <p className="text-sm text-gray-500">
          View and update your personal details and account information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={settings.username} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={settings.firstName} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={settings.lastName} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={settings.email} onChange={handleChange} />
          </div>
        </div>
      </div>

      <Button type="submit" className="mt-4">Save</Button>
    </form>
  );
};


const Theme: React.FC<{ settings: ThemeSettings; setSettings: React.Dispatch<React.SetStateAction<ThemeSettings>> }> = ({ settings, setSettings }) => {

  const handleChange = (e: string) => {
    document.body.classList.remove(settings.theme);
    document.body.classList.add(e);
    setSettings(prev => ({...prev, theme: e}));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving basic info:", settings);
    // In a real app, you'd send this data to an API
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-0.5">
        <h3 className="text-xl font-semibold tracking-tight" id="theme">Theme</h3>
        <p className="text-sm text-gray-500">
          View and change ui appearence settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Theme name</Label>
            <Select value={settings.theme} onValueChange={handleChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {
                    settings.availableThemes.map( theme => {
                      return <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                    })
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </form>
  );
};


export default function BasicSettings() {
    const [profileSettings, setProfileSettings] = useState<UserSettings>({
        username: 'nicol43',
        firstName: 'Stephanie',
        lastName: 'Nicol',
        email: 'stephanie_nicol@mail.com',
    });
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        theme: 'default',
        availableThemes: ['default', 'dark', 'light']
    });
    

    return (
        <div className="min-h-screen font-sans antialiased p-4 sm:p-8 lg:p-12">
          <header className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="relative w-full max-w-xs hidden sm:block">
              {/* Search Input Mock */}
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <Input placeholder="Search" className="pl-10" />
            </div>
          </header>
    
          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 shrink-0">
              <SidebarNav active="Profile" navItems={navItems} />
            </aside>
    
            {/* Settings Content */}
            <main className="flex-1 lg:max-w-4xl">
              <div className="pb-16">
                <Profile settings={profileSettings} setSettings={setProfileSettings} />
              </div>
              <hr />
              <div className="py-16">
                <Theme settings={themeSettings} setSettings={setThemeSettings} />
              </div>
            </main>
          </div>
        </div>
      );
}