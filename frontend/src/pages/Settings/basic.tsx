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

export default function BasicSettings() {
    const [settings, setSettings] = useState<UserSettings>({
        username: 'nicol43',
        firstName: 'Stephanie',
        lastName: 'Nicol',
        email: 'stephanie_nicol@mail.com',
    });
    
    return (
        <div className="pb-16">
            <BasicInfoForm settings={settings} setSettings={setSettings} />
            <ChangePasswordForm settings={settings} setSettings={setSettings} />
        </div>
    )
}