
'use client';

import dynamic from 'next/dynamic';
import type { NextPage } from 'next';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false, // Leaflet needs window object, so disable SSR for this component
});

const Home: NextPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">My Leaflet Map</h1>
      <div className="w-full max-w-4xl h-[70vh] rounded-lg shadow-xl overflow-hidden border">
        <MapDisplay />
      </div>
    </main>
  );
};

export default Home;
