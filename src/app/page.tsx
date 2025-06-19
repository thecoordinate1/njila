
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';
import { PackageIcon } from 'lucide-react';
import type { NextPage } from 'next'; 

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false, 
});

interface DeliveryBatch {
  id: string;
  stops: number;
  nextStopAddress: string;
  estimatedCompletion: string;
}

const HomePage: NextPage = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryBatch | null>(null);
  const driverName = "Alex Ryder"; // Placeholder

  useEffect(() => {
    if (isOnline) {
      // Simulate API call to fetch delivery batch
      console.log("Fetching delivery data...");
      setTimeout(() => {
        // Simulate finding a delivery
        setCurrentDelivery({
          id: 'BATCH789',
          stops: 3,
          nextStopAddress: '456 Oak Avenue, Townsville',
          estimatedCompletion: '55 mins',
        });
        // To simulate no deliveries found:
        // setCurrentDelivery(null);
      }, 2000);
    } else {
      setCurrentDelivery(null);
    }
  }, [isOnline]);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Map and Overlays Area */}
      <div className="relative flex-grow">
        {/* Map Container - explicitly ensure it's in the background */}
        <div className="absolute inset-0 z-0">
          <MapDisplay /> {/* Map takes available space of this container */}
        </div>

        {/* Header Overlay */}
        <header className="absolute top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto h-16 flex items-center justify-between px-4">
            <h1 className="text-3xl font-bold text-primary">OTW</h1>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-semibold text-sm text-foreground">{driverName}</p>
                <p className={`text-xs font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                aria-label="Online/Offline toggle"
                id="online-toggle"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content Area Overlays on map */}
        {/* Adjusted bottom to account for BottomNavbar (h-16 or 4rem) */}
        <main className="absolute top-16 left-0 right-0 bottom-16 p-4 overflow-y-auto space-y-4 z-10">
          {isOnline ? (
            currentDelivery ? (
              <Card className="shadow-lg rounded-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <PackageIcon className="mr-2 h-5 w-5 text-primary" />
                    Current Delivery Batch
                  </CardTitle>
                  <CardDescription>ID: {currentDelivery.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong className="text-foreground">Stops:</strong> {currentDelivery.stops}</p>
                  <p><strong className="text-foreground">Next Stop:</strong> {currentDelivery.nextStopAddress}</p>
                  <p><strong className="text-foreground">Est. Completion:</strong> {currentDelivery.estimatedCompletion}</p>
                  {/* Example button, can be customized or linked */}
                  {/* <Button className="w-full mt-3" variant="outline" size="sm">View Batch Details</Button> */}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg rounded-lg bg-card/95 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Looking for deliveries...</p>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="shadow-lg rounded-lg bg-card/95 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">You are offline. Go online to find deliveries.</p>
              </CardContent>
            </Card>
          )}
        </main>

        {/* The "Go Online/Offline Button Area" has been removed */}
      </div>

      {/* Bottom Navbar is h-16 (4rem) */}
      <BottomNavbar />
    </div>
  );
};

export default HomePage;
