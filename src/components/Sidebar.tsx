'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Package, ListChecks, BarChart2, Settings, LifeBuoy, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

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

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();

  const navLinkClasses = (href: string) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      { 'bg-muted text-primary': pathname === href }
    );

  return (
    <div className={cn(
        "fixed top-0 left-0 z-40 h-screen hidden border-r bg-background md:flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Truck className="h-6 w-6 text-primary" />
            {!isCollapsed && <span>Njila</span>}
          </Link>
        </div>
      <div className="flex-1 overflow-y-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={navLinkClasses(href)} title={isCollapsed ? label : undefined}>
                <Icon className="h-4 w-4" />
                {!isCollapsed && label}
              </Link>
            ))}
          </nav>
        </div>
      <div className="mt-auto p-4 border-t">
           <nav className="grid items-start text-sm font-medium gap-1">
             {bottomNavItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={navLinkClasses(href)} title={isCollapsed ? label : undefined}>
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && label}
                </Link>
             ))}
           </nav>
            <Button
                variant="ghost"
                className="w-full justify-center mt-4"
                onClick={toggleSidebar}
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        </div>
    </div>
  );
};

export default Sidebar;
