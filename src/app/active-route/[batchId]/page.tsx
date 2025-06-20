
'use client';

import type { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import BottomNavbar from '@/components/BottomNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Assuming Alert components exist or will be added
import {
  MapPinIcon,
  TruckIcon,
  PackageIcon,
  CheckCircle2Icon,
  NavigationIcon,
  AlertTriangleIcon,
  CameraIcon,
  Edit2Icon, // For signature
  ChevronLeftIcon,
  ListOrderedIcon,
} from 'lucide-react';
import type { DeliveryBatch, OrderStop } from '@/types/delivery';
import type { LatLngExpression } from 'leaflet';

// Mock Alert components if not present in ui
const FallbackAlert: React.FC<React.PropsWithChildren<{variant?: string}>> = ({children}) => <div style={{border: '1px solid red', padding: '10px', margin: '10px 0'}}>{children}</div>;
const FallbackAlertTitle: React.FC<React.PropsWithChildren<{}>> = ({children}) => <h4>{children}</h4>;
const FallbackAlertDescription: React.FC<React.PropsWithChildren<{}>> = ({children}) => <p>{children}</p>;

const DynamicMapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => <div className="flex-grow bg-muted flex items-center justify-center"><p>Loading Map...</p></div>,
});


const mockBatchData: DeliveryBatch = {
  id: 'BATCH789',
  label: 'Downtown Multi-Drop',
  stops: [
    { id: 'S1', type: 'pickup', address: '123 Main St, Warehouse A, Anytown, USA', shortAddress: '123 Main St (Warehouse)', coordinates: [34.0522, -118.2437], status: 'pending', sequence: 1, items: ['Electronics Box'] },
    { id: 'S2', type: 'dropoff', address: '456 Oak Ave, Suite 101, Anytown, USA', shortAddress: '456 Oak Ave (Suite 101)', coordinates: [34.0560, -118.2500], status: 'pending', sequence: 2, items: ['Electronics Box'] },
    { id: 'S3', type: 'pickup', address: '789 Pine Ln, Loading Bay 3, Anytown, USA', shortAddress: '789 Pine Ln (Bay 3)', coordinates: [34.0500, -118.2550], status: 'pending', sequence: 3, items: ['Documents Package'] },
    { id: 'S4', type: 'dropoff', address: '101 Maple Dr, Anytown, USA', shortAddress: '101 Maple Dr', coordinates: [34.0600, -118.2400], status: 'pending', sequence: 4, items: ['Documents Package'] },
  ],
  estimatedTotalTime: '1hr 15mins',
  estimatedTotalDistance: '12.5 km',
};

const ActiveRoutePage: NextPage = () => {
  const router = useRouter();
  const params = useParams();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<DeliveryBatch | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [stopStatuses, setStopStatuses] = useState<Record<string, OrderStop['status']>>({});
  const [driverLocation, setDriverLocation] = useState<LatLngExpression | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showProofUpload, setShowProofUpload] = useState(false);

  useEffect(() => {
    // In a real app, fetch batch data based on batchId
    setBatch(mockBatchData);
    const initialStatuses: Record<string, OrderStop['status']> = {};
    mockBatchData.stops.forEach(stop => {
      initialStatuses[stop.id] = stop.status;
    });
    setStopStatuses(initialStatuses);
  }, [batchId]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setDriverLocation([position.coords.latitude, position.coords.longitude]);
        setGpsError(null);
      },
      (error) => {
        console.error('Error getting geolocation:', error);
        setGpsError(error.message || 'Unable to retrieve location. Please ensure GPS is enabled.');
        setDriverLocation(null); // Clear location on error
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const currentStop = useMemo(() => {
    if (!batch) return null;
    return batch.stops[currentStopIndex];
  }, [batch, currentStopIndex]);

  const handleStatusUpdate = () => {
    if (!batch || !currentStop) return;

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
           // For drop-off, "Delivered" action leads to proof upload
           setShowProofUpload(true);
           // Status will be updated after proof
           return;
        }
        break;
    }
    
    if (nextStatus) {
      setStopStatuses(prev => ({ ...prev, [currentStop.id]: nextStatus! }));
      // If status is 'picked_up' or (if we skipped proof) 'delivered', move to next stop or complete batch
      if (nextStatus === 'picked_up') {
        if (currentStopIndex < batch.stops.length - 1) {
          setCurrentStopIndex(prev => prev + 1);
        } else {
          console.log('Batch completed!'); // Placeholder for batch completion
          router.push('/'); // Redirect or go to summary
        }
      }
    }
  };

  const handleProofSubmitted = () => {
    if (!batch || !currentStop) return;
    setStopStatuses(prev => ({ ...prev, [currentStop.id]: 'delivered' }));
    setShowProofUpload(false);
    if (currentStopIndex < batch.stops.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
    } else {
      console.log('Batch completed!');
      router.push('/');
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

  if (!batch) {
    return (
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
              <ChevronLeftIcon className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-primary truncate">Loading Delivery...</h1>
          </div>
        </header>
        <div className="flex-grow flex items-center justify-center">Loading batch details...</div>
        <BottomNavbar />
      </div>
    );
  }
  
  const stopsForMap = batch.stops.filter(s => stopStatuses[s.id] !== 'delivered' && stopStatuses[s.id] !== 'picked_up');


  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeftIcon className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight text-primary truncate flex-1">
            Active: {batch.label} ({currentStop?.sequence}/{batch.stops.length})
          </h1>
        </div>
      </header>

      {/* Map takes ~70% height, content below takes ~30% */}
      <div className="flex-grow flex flex-col" style={{ height: 'calc(100vh - 4rem - 4rem)'}}> {/* Adjust for header and navbar */}
        <div className="bg-muted" style={{ height: '65%' }}>
          {gpsError && (
             <FallbackAlert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <FallbackAlertTitle>GPS Error</FallbackAlertTitle>
              <FallbackAlertDescription>{gpsError}</FallbackAlertDescription>
            </FallbackAlert>
          )}
          {!gpsError && driverLocation && (
            <DynamicMapDisplay
              driverLocation={driverLocation}
              stops={batch.stops} // Pass all stops for markers
              currentStopId={currentStop?.id}
              // The MapDisplay will construct its route from driverLocation through pending stops
            />
          )}
          {!gpsError && !driverLocation && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <NavigationIcon className="w-8 h-8 mr-2 animate-pulse" /> Acquiring GPS signal...
            </div>
          )}
        </div>

        <div className="bg-background shadow-t-lg" style={{ height: '35%', display: 'flex', flexDirection: 'column' }}>
          {showProofUpload && currentStop ? (
             <Card className="m-2 flex-grow overflow-y-auto shadow-none border-none">
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
            <Card className="m-2 flex-grow overflow-y-auto shadow-none border-none">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base flex items-center">
                  <ListOrderedIcon className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Stops
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                {batch.stops.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {batch.stops.map((stop, index) => (
                      <li
                        key={stop.id}
                        className={`p-3 ${stop.id === currentStop?.id ? 'bg-primary/10' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className={`mr-2 h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                              stop.id === currentStop?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {stop.sequence}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-foreground flex items-center">
                                {stop.type === 'pickup' ? <TruckIcon className="h-4 w-4 mr-1.5 text-blue-500" /> : <PackageIcon className="h-4 w-4 mr-1.5 text-green-500" />}
                                {stop.type === 'pickup' ? 'Pickup' : 'Dropoff'}: {stop.shortAddress}
                              </div>
                              <p className="text-xs text-muted-foreground">{stop.items?.join(', ') || 'Items unspecified'}</p>
                            </div>
                          </div>
                          <Badge variant={stopStatuses[stop.id] === 'delivered' || stopStatuses[stop.id] === 'picked_up' ? 'default' : (stop.id === currentStop?.id ? 'destructive' : 'outline')}
                                 className={
                                    stopStatuses[stop.id] === 'delivered' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                                    stopStatuses[stop.id] === 'picked_up' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                    stop.id === currentStop?.id ? (stopStatuses[stop.id] === 'pending' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-black') : ''
                                  }>
                            {stopStatuses[stop.id]?.replace(/_/g, ' ')}
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
      <BottomNavbar />
    </div>
  );
};

export default ActiveRoutePage;

    