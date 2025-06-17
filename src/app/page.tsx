
'use client';

import dynamic from 'next/dynamic';
import type { NextPage } from 'next';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false, // Leaflet needs window object, so disable SSR for this component
});

const Home: NextPage = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="w-screen h-screen">
        <MapDisplay />
      </div>
    </main>
  );
};

export default Home;
