import { Input } from "@/components/ui/input";
import { Outlet } from "@tanstack/react-router";

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

// Main App Component
export default function Settings() {
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};