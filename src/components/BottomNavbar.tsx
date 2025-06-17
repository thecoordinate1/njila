
'use client';

import type React from 'react';
import { MapPinIcon, SettingsIcon, ListChecksIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const BottomNavbar: React.FC = () => {
  // Example active route - in a real app, this would come from useRouter or similar
  const activeRoute = '/map';

  const navItemClasses = (path: string) =>
    cn(
      "flex-1", // Each item takes up equal width
      "flex flex-col items-center justify-center", // Center content within the section
      "h-full", // Ensure the link fills the height of the navbar
      "text-primary-foreground", // Base text color for icons and text
      "transition-all duration-200 ease-in-out", // Smooth transitions for opacity and background
      // No rounded-md here for a flush section highlight
      {
        "bg-primary-foreground/20 opacity-100": activeRoute === path, // Active section has background and full opacity
        "opacity-70 hover:opacity-100": activeRoute !== path, // Inactive sections are less opaque, full on hover
      }
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-primary border-t border-primary-foreground/20 shadow-md z-50">
      <div className="flex h-full"> {/* Parent flex container for the sections */}
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
