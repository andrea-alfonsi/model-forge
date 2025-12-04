export default function SidebarNav({ active, navItems }: { active: string, navItems: { name: string, href: string }[]}) {
  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            item.name === active
              ? ''
              : ''
          }`}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
};