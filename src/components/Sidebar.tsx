
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Package, ListChecks, BarChart2, Settings, LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: ListChecks },
  { href: '/deliveries', label: 'Deliveries', icon: Package },
  { href: '/drivers', label: 'Drivers', icon: Truck },
  { href: '/history', label: 'Reports', icon: BarChart2 },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/support', label: 'Support', icon: LifeBuoy },
]

const Sidebar = () => {
  const pathname = usePathname();

  const navLinkClasses = (href: string) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      { 'bg-muted text-primary': pathname === href }
    );

  return (
    <div className="hidden border-r bg-card md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Truck className="h-6 w-6 text-primary" />
            <span>Njila</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={navLinkClasses(href)}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
           <nav className="grid items-start text-sm font-medium gap-1">
             {bottomNavItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={navLinkClasses(href)}>
                    <Icon className="h-4 w-4" />
                    {label}
                </Link>
             ))}
           </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
