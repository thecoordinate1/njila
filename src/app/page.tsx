
'use client';

import dynamic from 'next/dynamic';
import type { NextPage } from 'next';
import BottomNavbar from '@/components/BottomNavbar';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false, // Leaflet needs window object, so disable SSR for this component
});

const Home: NextPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* The main content area where the map will be displayed.
          It's set to take full screen width and height, with padding at the bottom
          to make space for the fixed navbar. */}
      <main className="w-screen h-screen pb-16"> {/* pb-16 provides space for the 4rem (h-16) navbar */}
        <MapDisplay />
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Home;
