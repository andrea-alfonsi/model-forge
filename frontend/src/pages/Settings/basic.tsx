import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface UserSettings {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  verifyPassword?: string;
}

// Sidebar Navigation Component
const SidebarNav: React.FC<{ active: string }> = ({ active }) => {
  const navItems = [
    { name: 'Profile', href: '#profile' },
    { name: 'Account', href: '#account' },
    { name: 'Members', href: '#members' },
    { name: 'Billing', href: '#billing' },
    { name: 'Invoices', href: '#invoices' },
    { name: 'API', href: '#api' },
  ];

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            item.name === active
              ? 'bg-gray-100 text-black'
              : 'hover:bg-gray-50 hover:text-black text-gray-700'
          }`}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
};

// Basic Information Form Section
const BasicInfoForm: React.FC<{ settings: UserSettings; setSettings: React.Dispatch<React.SetStateAction<UserSettings>> }> = ({ settings, setSettings }) => {

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
        <h3 className="text-xl font-semibold tracking-tight">Basic information</h3>
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

// Change Password Form Section
const ChangePasswordForm: React.FC<{ settings: UserSettings; setSettings: React.Dispatch<React.SetStateAction<UserSettings>> }> = ({ settings, setSettings }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating password...");
    // Password update logic
  };

  return (
    <form onSubmit={handleUpdatePassword} className="space-y-6 pt-10 border-t border-gray-200 mt-10">
      <div className="space-y-0.5">
        <h3 className="text-xl font-semibold tracking-tight">Change password</h3>
        <p className="text-sm text-gray-500">
          Update your password to keep your account secure.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" placeholder="********" value={settings.password} onChange={handleChange} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="********" value={settings.verifyPassword} onChange={handleChange} />
            </div>
        </div>
        <div className="space-y-4">
             <div className="space-y-1">
                <Label htmlFor="verifyCurrentPassword">Verify current password</Label>
                <Input id="verifyCurrentPassword" type="password" placeholder="********" />
            </div>
        </div>
      </div>
      <Button type="submit" variant="outline" className="mt-4">Update password</Button>
    </form>
  );
};

// Main App Component
export default function BasicSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    username: 'nicol43',
    firstName: 'Stephanie',
    lastName: 'Nicol',
    email: 'stephanie_nicol@mail.com',
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased p-4 sm:p-8 lg:p-12">
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
          <SidebarNav active="Profile" />
        </aside>

        {/* Settings Content */}
        <main className="flex-1 lg:max-w-4xl">
          <div className="pb-16">
            <BasicInfoForm settings={settings} setSettings={setSettings} />
            <ChangePasswordForm settings={settings} setSettings={setSettings} />
          </div>
        </main>
      </div>
    </div>
  );
};