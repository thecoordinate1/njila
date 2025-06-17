
'use client';

import type React from 'react';
import { HomeIcon, MapPinIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const BottomNavbar: React.FC = () => {
  // Example active route - in a real app, this would come from useRouter or similar
  const activeRoute = '/'; // or '/map', '/settings'

  const navItemClasses = (path: string) =>
    cn(
      "flex flex-col items-center justify-center h-full px-2 text-muted-foreground hover:text-primary transition-colors",
      {
        "text-primary": activeRoute === path,
      }
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border shadow-md z-50">
      <div className="flex justify-around items-stretch h-full">
        <Link href="/" className={navItemClasses('/')}>
          <HomeIcon className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="#" className={navItemClasses('/map')}> {/* Assuming map might be a different page or section */}
          <MapPinIcon className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Map</span>
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
