
'use client';

import type React from 'react';
import { MapPinIcon, SettingsIcon, ListChecksIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const BottomNavbar: React.FC = () => {
  // Example active route - in a real app, this would come from useRouter or similar
  const activeRoute = '/map'; // Adjusted example as Home is removed, making "Map" active

  const navItemClasses = (path: string) =>
    cn(
      "flex flex-col items-center justify-center h-full px-2 text-primary-foreground transition-all duration-200 ease-in-out rounded-md", // Added rounded-md for background styling
      {
        "bg-primary-foreground/20 opacity-100": activeRoute === path, // Active items have a background and full opacity
        "opacity-70 hover:opacity-100": activeRoute !== path, // Inactive items are less opaque, full on hover
      }
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-primary border-t border-primary-foreground/20 shadow-md z-50">
      <div className="flex justify-around items-stretch h-full">
        <Link href="#" className={navItemClasses('/map')}>
          <MapPinIcon className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Map</span>
        </Link>
        <Link href="#" className={navItemClasses('/orders')}>
          <ListChecksIcon className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Orders</span>
        </Link>
        <Link href="#" className={navItemClasses('/profile')}>
          <UserIcon className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Profile</span>
        </Link>
        <Link href="#" className={navItemClasses('/settings')}>
          <SettingsIcon className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Settings</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavbar;
