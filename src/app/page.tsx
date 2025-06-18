
'use client';

import dynamic from 'next/dynamic';
import type { NextPage } from 'next';
import BottomNavbar from '@/components/BottomNavbar';
import { useSearchParams } from 'next/navigation';
import type { LatLngExpression } from 'leaflet';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false, 
});

const Home: NextPage = () => {
  const searchParams = useSearchParams();
  const pickupLat = searchParams.get('pickupLat');
  const pickupLng = searchParams.get('pickupLng');
  const destLat = searchParams.get('destLat');
  const destLng = searchParams.get('destLng');

  let orderCoordinates: { pickup: LatLngExpression; destination: LatLngExpression } | undefined = undefined;

  if (pickupLat && pickupLng && destLat && destLng) {
    const pLat = parseFloat(pickupLat);
    const pLng = parseFloat(pickupLng);
    const dLat = parseFloat(destLat);
    const dLng = parseFloat(destLng);

    if (!isNaN(pLat) && !isNaN(pLng) && !isNaN(dLat) && !isNaN(dLng)) {
      orderCoordinates = {
        pickup: [pLat, pLng],
        destination: [dLat, dLng],
      };
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="w-screen h-screen pb-16">
        <MapDisplay orderCoordinates={orderCoordinates} />
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Home;
