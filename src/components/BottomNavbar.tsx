
'use client';

import type React from 'react';
import { HomeIcon, BriefcaseIcon, HistoryIcon } from 'lucide-react'; // Changed icons
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const BottomNavbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/jobs', icon: BriefcaseIcon, label: 'Jobs' }, // Changed to /jobs
    { href: '/history', icon: HistoryIcon, label: 'History' }, // Changed to /history
  ];

  const navItemClasses = (path: string, currentPathname: string) =>
    cn(
      "flex-1",
      "flex flex-col items-center justify-center",
      "h-full",
      "text-primary-foreground", // Text color for icons and labels on primary background
      "transition-all duration-200 ease-in-out",
      "rounded-t-sm", // Slight rounding for active tab indicator
      {
        "bg-primary-foreground/20 opacity-100": currentPathname === path, // Active state with subtle background
        "opacity-70 hover:opacity-100 hover:bg-primary-foreground/10": currentPathname !== path, // Inactive state
      }
    );

  return (
    // Navbar itself is h-16 (4rem)
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-primary border-t border-primary-foreground/20 shadow-lg z-50">
      <div className="flex h-full">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={navItemClasses(item.href, pathname)}>
            <item.icon className="w-6 h-6 mb-0.5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;
