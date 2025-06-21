
'use client';

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
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
  HomeIcon,
  EraserIcon,
} from 'lucide-react';
import type { NextPage } from 'next';
import type { DeliveryBatch, OrderStop } from '@/types/delivery';
import type { LatLngExpression } from 'leaflet';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import SignatureCanvas from 'react-signature-canvas';

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

  // State for Proof of Delivery
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const sigCanvasRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    const autoStartParam = searchParams.get('autoStartDelivery');
    const acceptedJobId = searchParams.get('jobId');

    if (autoStartParam === 'true' && !isOnline && !currentDelivery) {
      console.log(`Auto-starting delivery, triggered by job ID: ${acceptedJobId || 'any available'}`);
      setIsOnline(true); 

      const newPath = pathname; 
      router.replace(newPath, undefined); 
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
          let errorMessage = 'Unable to retrieve location. GPS might be disabled or permissions denied.';
          if (error && typeof error.message === 'string' && error.message.trim() !== '') {
            errorMessage = error.message;
          } else if (error && typeof error.code === 'number') {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Geolocation permission denied. Please enable location services for this app in your browser/system settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is currently unavailable. Please check your GPS signal or try again later.";
                break;
              case error.TIMEOUT:
                errorMessage = "The request to get user location timed out. Please check your connection or try again.";
                break;
              default:
                errorMessage = `An unknown geolocation error occurred (Code: ${error.code}).`;
            }
          }
          console.error(`Geolocation error: ${errorMessage} (Code: ${error?.code})`, 'Raw error object:', error);
          setGpsError(errorMessage);
          setDriverLocation(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
        const noGeoMessage = "Geolocation is not supported by this browser or is unavailable.";
        console.warn(noGeoMessage);
        setGpsError(noGeoMessage);
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
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
        }, 1000); 
      }
    } else {
      setCurrentDelivery(null);
      setStopStatuses({});
      setCurrentStopIndex(0);
      setShowProofUpload(false);
    }
  }, [isOnline, currentDelivery]); 

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
        }
      }
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSignature = () => {
    sigCanvasRef.current?.clear();
  };

  const handleProofSubmitted = () => {
    if (!currentDelivery || !currentStop) return;
    
    const signatureData = sigCanvasRef.current?.isEmpty() ? null : sigCanvasRef.current?.toDataURL();

    console.log("Submitting Proof of Delivery...");
    console.log("Photo File:", photoFile);
    console.log("Signature Data URL (trimmed):", signatureData ? signatureData.substring(0, 50) + '...' : "No signature");

    setStopStatuses(prev => ({ ...prev, [currentStop.id]: 'delivered' }));
    setShowProofUpload(false);
    
    // Reset proof states for the next delivery
    setPhotoPreview(null);
    setPhotoFile(null);
    sigCanvasRef.current?.clear();

    if (currentStopIndex < currentDelivery.stops.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
    } else {
      console.log('Batch completed!');
      setCurrentDelivery(null);
    }
  };

  const getActionButtonConfig = () => {
    if (!currentStop) return { text: 'Loading...', disabled: true, action: () => {} };
    const status = stopStatuses[currentStop.id];

    if (showProofUpload) {
        return { text: 'Confirm Delivery', disabled: !photoFile, action: handleProofSubmitted, icon: CheckCircle2Icon };
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
                    Proof of Delivery: {currentStop.shortAddress}
                  </CardTitle>
                  <CardDescription className="text-xs pt-1">For items: {currentStop.items?.join(', ')}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Photo Proof</label>
                    <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden border">
                      {photoPreview ? (
                        <Image src={photoPreview} alt="Proof of delivery" layout="fill" objectFit="cover" />
                      ) : (
                        <span className="text-muted-foreground text-xs">Photo Preview</span>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full mt-2">
                      <label htmlFor="photoProof" className="cursor-pointer flex items-center justify-center">
                        <CameraIcon className="mr-2 h-4 w-4" />
                        {photoPreview ? 'Retake' : 'Take'} Photo
                      </label>
                    </Button>
                    <input type="file" id="photoProof" accept="image/*" capture="environment" className="sr-only" onChange={handlePhotoChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Recipient Signature</label>
                    <div className="relative w-full h-32 rounded-md border bg-white">
                      <SignatureCanvas
                        ref={sigCanvasRef}
                        penColor='black'
                        canvasProps={{ className: 'w-full h-full rounded-md' }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7"
                        onClick={handleClearSignature}
                        aria-label="Clear signature"
                      >
                        <EraserIcon className="h-4 w-4" />
                      </Button>
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
                   gpsError ? 
                   <Alert variant="destructive" className="mb-4">
                     <AlertTriangleIcon className="h-4 w-4" />
                     <AlertTitle>GPS Error</AlertTitle>
                     <AlertDescription>{gpsError}</AlertDescription>
                   </Alert> :
                  <p className="text-center text-muted-foreground">Looking for deliveries...</p>
                ) : (
                  <p className="text-center text-muted-foreground">You are offline. Go online to find deliveries.</p>
                )}
                 {isOnline && !gpsError && !driverLocation && ( 
                    <div className="flex items-center justify-center text-muted-foreground">
                        <NavigationIcon className="w-5 h-5 mr-2 animate-pulse" /> Acquiring GPS signal...
                    </div>
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

const HomePage: NextPage = () => {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading page...</div>}>
      <HomePageContent />
    </Suspense>
  );
};

export default HomePage;
    
