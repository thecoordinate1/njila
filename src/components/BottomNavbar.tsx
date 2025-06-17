
'use client';

import type React from 'react';
import { MapPinIcon, SettingsIcon, ListChecksIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const BottomNavbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: MapPinIcon, label: 'Map' },
    { href: '/orders', icon: ListChecksIcon, label: 'Orders' },
    { href: '/profile', icon: UserIcon, label: 'Profile' },
    { href: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const navItemClasses = (path: string, currentPathname: string) =>
    cn(
      "flex-1",
      "flex flex-col items-center justify-center",
      "h-full",
      "text-primary-foreground",
      "transition-all duration-200 ease-in-out",
      {
        "bg-primary-foreground/20 opacity-100": currentPathname === path,
        "opacity-70 hover:opacity-100": currentPathname !== path,
      }
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-primary border-t border-primary-foreground/20 shadow-md z-50">
      <div className="flex h-full">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={navItemClasses(item.href, pathname)}>
            <item.icon className="w-6 h-6 mb-0.5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;
