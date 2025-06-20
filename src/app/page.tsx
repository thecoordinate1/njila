
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  PackageIcon,
  MapPinIcon,
  TruckIcon,
  CheckCircle2Icon,
  NavigationIcon,
  AlertTriangleIcon,
  CameraIcon,
  Edit2Icon,
  ChevronLeftIcon,
  ListOrderedIcon,
  HomeIcon
} from 'lucide-react';
import type { NextPage } from 'next';
import type { DeliveryBatch, OrderStop } from '@/types/delivery';
import type { LatLngExpression } from 'leaflet';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const DynamicMapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => <div className="h-full bg-muted flex items-center justify-center"><p>Loading Map...</p></div>,
});

const mockBatchData: DeliveryBatch = {
  id: 'BATCH_LSK001',
  label: 'Lusaka Central Drops',
  stops: [
    { id: 'LSK_S1', type: 'pickup', address: 'Kamwala Market, Independence Ave, Lusaka', shortAddress: 'Kamwala Market', coordinates: [-15.4320, 28.2910], status: 'pending', sequence: 1, items: ['Groceries Basket'] },
    { id: 'LSK_S2', type: 'dropoff', address: 'EastPark Mall, Great East Rd, Lusaka', shortAddress: 'EastPark Mall', coordinates: [-15.3990, 28.3410], status: 'pending', sequence: 2, items: ['Groceries Basket'] },
    { id: 'LSK_S3', type: 'pickup', address: 'University Teaching Hospital (UTH), Nationalist Rd, Lusaka', shortAddress: 'UTH Lusaka', coordinates: [-15.4050, 28.3000], status: 'pending', sequence: 3, items: ['Medical Supplies'] },
    { id: 'LSK_S4', type: 'dropoff', address: 'Manda Hill Mall, Great East Rd, Lusaka', shortAddress: 'Manda Hill Mall', coordinates: [-15.4020, 28.3190], status: 'pending', sequence: 4, items: ['Medical Supplies'] },
  ],
  estimatedTotalTime: '1hr 30mins',
  estimatedTotalDistance: '18.5 km',
};

// It's good practice to wrap components that use useSearchParams in Suspense
// However, for a page-level component, Next.js might handle this implicitly.
// For explicit control, especially if parts of the page render sooner:
const HomePageContent: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOnline, setIsOnline] = useState(false);
  const [driverName] = useState("Alex Ryder"); 

  const [currentDelivery, setCurrentDelivery] = useState<DeliveryBatch | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [stopStatuses, setStopStatuses] = useState<Record<string, OrderStop['status']>>({});
  const [driverLocation, setDriverLocation] = useState<LatLngExpression | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showProofUpload, setShowProofUpload] = useState(false);

  // Effect to handle auto-starting delivery from query parameters
  useEffect(() => {
    const autoStartParam = searchParams.get('autoStartDelivery');
    const acceptedJobId = searchParams.get('jobId');

    if (autoStartParam === 'true' && !isOnline && !currentDelivery) {
      console.log(`Auto-starting delivery, triggered by job ID: ${acceptedJobId || 'any available'}`);
      setIsOnline(true); // This triggers the effect below to load mockBatchData

      // Clear the query parameters to prevent re-triggering
      router.replace(pathname, undefined); 
    }
  }, [searchParams, isOnline, currentDelivery, setIsOnline, router, pathname]);


  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation([position.coords.latitude, position.coords.longitude]);
          setGpsError(null);
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          setGpsError(error.message || 'Unable to retrieve location. GPS might be disabled.');
          setDriverLocation(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      // If going online and no current delivery, simulate fetching one
      if (!currentDelivery) { 
        console.log("Driver online. Simulating fetching delivery data...");
        setTimeout(() => {
          setCurrentDelivery(mockBatchData);
          const initialStatuses: Record<string, OrderStop['status']> = {};
          mockBatchData.stops.forEach(stop => {
            initialStatuses[stop.id] = stop.status;
          });
          setStopStatuses(initialStatuses);
          setCurrentStopIndex(0); 
          setShowProofUpload(false);
        }, 1000); // Simulate network delay
      }
    } else {
      // If going offline, clear delivery data
      setCurrentDelivery(null);
      setStopStatuses({});
      setCurrentStopIndex(0);
      setShowProofUpload(false);
    }
  }, [isOnline, currentDelivery]); // currentDelivery added to dep array to prevent re-fetch if already set

  const currentStop = useMemo(() => {
    if (!currentDelivery) return null;
    return currentDelivery.stops[currentStopIndex];
  }, [currentDelivery, currentStopIndex]);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleStatusUpdate = () => {
    if (!currentDelivery || !currentStop) return;

    let nextStatus: OrderStop['status'] | null = null;
    const currentStatus = stopStatuses[currentStop.id];

    switch (currentStop.type) {
      case 'pickup':
        if (currentStatus === 'pending') nextStatus = 'arrived_at_pickup';
        else if (currentStatus === 'arrived_at_pickup') nextStatus = 'picked_up';
        break;
      case 'dropoff':
        if (currentStatus === 'pending') nextStatus = 'arrived_at_dropoff';
        else if (currentStatus === 'arrived_at_dropoff') {
           setShowProofUpload(true);
           return; 
        }
        break;
    }
    
    if (nextStatus) {
      setStopStatuses(prev => ({ ...prev, [currentStop.id]: nextStatus! }));
      if (nextStatus === 'picked_up') { 
        if (currentStopIndex < currentDelivery.stops.length - 1) {
          setCurrentStopIndex(prev => prev + 1);
        } else {
          console.log('Batch completed!');
          setCurrentDelivery(null); 
          // setIsOnline(false); // Optionally go offline after batch completion
        }
      }
    }
  };

  const handleProofSubmitted = () => {
    if (!currentDelivery || !currentStop) return;
    setStopStatuses(prev => ({ ...prev, [currentStop.id]: 'delivered' }));
    setShowProofUpload(false);
    if (currentStopIndex < currentDelivery.stops.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
    } else {
      console.log('Batch completed!');
      setCurrentDelivery(null);
      // setIsOnline(false); // Optionally go offline
    }
  };

  const getActionButtonConfig = () => {
    if (!currentStop) return { text: 'Loading...', disabled: true, action: () => {} };
    const status = stopStatuses[currentStop.id];

    if (showProofUpload) {
        return { text: 'Submit Proof', disabled: false, action: handleProofSubmitted, icon: CheckCircle2Icon };
    }

    switch (currentStop.type) {
      case 'pickup':
        if (status === 'pending') return { text: 'Arrived at Pickup', disabled: !driverLocation, action: handleStatusUpdate, icon: NavigationIcon };
        if (status === 'arrived_at_pickup') return { text: 'Confirm Pickup', disabled: false, action: handleStatusUpdate, icon: TruckIcon };
        if (status === 'picked_up') return { text: 'Pickup Complete', disabled: true, action: () => {}, icon: CheckCircle2Icon };
        break;
      case 'dropoff':
        if (status === 'pending') return { text: 'Arrived at Dropoff', disabled: !driverLocation, action: handleStatusUpdate, icon: NavigationIcon };
        if (status === 'arrived_at_dropoff') return { text: 'Deliver Items & Get Proof', disabled: false, action: handleStatusUpdate, icon: PackageIcon };
        if (status === 'delivered') return { text: 'Dropoff Complete', disabled: true, action: () => {}, icon: CheckCircle2Icon };
        break;
    }
    return { text: 'Processing...', disabled: true, action: () => {} };
  };

  const { text: actionButtonText, disabled: actionButtonDisabled, action: actionButtonAction, icon: ActionButtonIcon } = getActionButtonConfig();

  const headerTitle = useMemo(() => {
    if (isOnline && currentDelivery && currentStop) {
      return `Active: ${currentDelivery.label} (${currentStop.sequence}/${currentDelivery.stops.length})`;
    }
    return "OTW";
  }, [isOnline, currentDelivery, currentStop]);


  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary truncate flex-1">
            {headerTitle === "OTW" && <HomeIcon className="inline-block mr-2 h-6 w-6 align-text-bottom" />}
            {headerTitle}
          </h1>
          <div className="flex items-center space-x-3 ml-2">
            <div className="text-right">
              <p className="font-semibold text-sm text-foreground whitespace-nowrap">{driverName}</p>
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

      {isOnline && currentDelivery ? (
        <div className="flex-grow flex flex-col" style={{ height: 'calc(100vh - 4rem - 4rem)'}}> 
          <div className="bg-muted" style={{ height: '65%', position: 'relative' }}>
            {gpsError && (
              <div className="absolute top-2 left-2 right-2 z-10">
                <Alert variant="destructive">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertTitle>GPS Error</AlertTitle>
                  <AlertDescription>{gpsError}</AlertDescription>
                </Alert>
              </div>
            )}
            <DynamicMapDisplay
              driverLocation={driverLocation}
              stops={currentDelivery.stops}
              currentStopId={currentStop?.id}
            />
             {!gpsError && !driverLocation && ( 
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/80 z-20">
                <NavigationIcon className="w-8 h-8 mr-2 animate-pulse" /> Acquiring GPS signal...
              </div>
            )}
          </div>

          <div className="bg-background shadow-t-lg" style={{ height: '35%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {showProofUpload && currentStop ? (
              <Card className="m-2 flex-grow overflow-y-auto shadow-none border-none rounded-none">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center">
                    <PackageIcon className="mr-2 h-5 w-5 text-primary" />
                    Proof of Delivery for: {currentStop.shortAddress}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3 text-sm">
                  <p className="text-xs text-muted-foreground">Stop {currentStop.sequence}: {currentStop.items?.join(', ')}</p>
                  <div className="space-y-2">
                      <label htmlFor="photoProof" className="block text-xs font-medium text-foreground">Photo of Delivered Item(s):</label>
                      <input type="file" id="photoProof" accept="image/*" className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border file:border-input file:bg-background file:text-xs file:font-medium file:text-primary hover:file:bg-primary/10" />
                  </div>
                  <div className="space-y-1">
                      <label className="block text-xs font-medium text-foreground">Recipient Signature:</label>
                      <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center text-muted-foreground border border-input">
                          <Edit2Icon className="h-5 w-5 mr-1" /> Placeholder for signature pad
                      </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="m-2 flex-grow overflow-y-auto shadow-none border-none rounded-none">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center">
                    <ListOrderedIcon className="mr-2 h-5 w-5 text-primary" />
                    Upcoming Stops
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-2">
                  {currentDelivery.stops.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {currentDelivery.stops.map((stop) => (
                        <li
                          key={stop.id}
                          className={`p-3 ${stop.id === currentStop?.id ? 'bg-primary/10' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                              <span className={`mr-2 h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold flex-shrink-0 ${
                                stop.id === currentStop?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}>
                                {stop.sequence}
                              </span>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground flex items-center truncate">
                                  {stop.type === 'pickup' ? <TruckIcon className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" /> : <PackageIcon className="h-4 w-4 mr-1.5 text-green-500 flex-shrink-0" />}
                                  <span className="truncate">{stop.type === 'pickup' ? 'Pickup' : 'Dropoff'}: {stop.shortAddress}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{stop.items?.join(', ') || 'Items unspecified'}</p>
                              </div>
                            </div>
                            <Badge variant={stopStatuses[stop.id] === 'delivered' || stopStatuses[stop.id] === 'picked_up' ? 'default' : (stop.id === currentStop?.id ? 'destructive' : 'outline')}
                                   className={`ml-2 flex-shrink-0 whitespace-nowrap ${
                                      stopStatuses[stop.id] === 'delivered' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                                      stopStatuses[stop.id] === 'picked_up' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                      (stop.id === currentStop?.id && stopStatuses[stop.id] === 'pending') ? 'bg-orange-500 hover:bg-orange-600 text-white' : 
                                      (stop.id === currentStop?.id && (stopStatuses[stop.id] === 'arrived_at_pickup' || stopStatuses[stop.id] === 'arrived_at_dropoff')) ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 
                                      '' 
                                    }`}>
                              {stopStatuses[stop.id]?.replace(/_/g, ' ') || 'Unknown'}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No stops in this batch.</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="p-3 border-t bg-background">
              <Button
                size="lg"
                className="w-full"
                onClick={actionButtonAction}
                disabled={actionButtonDisabled}
              >
                {ActionButtonIcon && <ActionButtonIcon className="mr-2 h-5 w-5" />}
                {actionButtonText}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex-grow">
          <div className="absolute inset-0 z-0">
            <DynamicMapDisplay driverLocation={driverLocation} />
          </div>
          <main className="absolute top-0 left-0 right-0 bottom-0 p-4 overflow-y-auto space-y-4 z-10 flex items-center justify-center">
            <Card className="shadow-lg rounded-lg bg-card/95 backdrop-blur-sm w-full max-w-sm">
              <CardContent className="pt-6">
                {isOnline ? (
                  <p className="text-center text-muted-foreground">Looking for deliveries...</p>
                ) : (
                  <p className="text-center text-muted-foreground">You are offline. Go online to find deliveries.</p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      )}

      <BottomNavbar />
    </div>
  );
};

// Wrapper component to ensure Suspense is used correctly with useSearchParams
const HomePage: NextPage = () => {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading page...</div>}>
      <HomePageContent />
    </Suspense>
  );
};

export default HomePage;
    
