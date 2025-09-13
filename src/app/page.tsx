
'use client';

import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  PackageIcon,
  MapPinIcon,
  TruckIcon,
  CheckCircle2Icon,
  NavigationIcon,
  AlertTriangleIcon,
  ListOrderedIcon,
  HomeIcon,
  XCircleIcon,
  RefreshCwIcon,
} from 'lucide-react';
import type { NextPage } from 'next';
import type { DeliveryBatch, OrderStop } from '@/types/delivery';
import type { LatLngExpression } from 'leaflet';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const DynamicMapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => <div className="h-full bg-muted flex items-center justify-center"><p>Loading Map...</p></div>,
});

// Hardcoded correct delivery code for simulation
const CORRECT_DELIVERY_CODE = "123456";

const HomePageContent: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const [isOnline, setIsOnline] = useState(false);
  const [driverName, setDriverName] = useState("Driver"); 

  const [currentDelivery, setCurrentDelivery] = useState<DeliveryBatch | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [stopStatuses, setStopStatuses] = useState<Record<string, OrderStop['status']>>({});
  const [driverLocation, setDriverLocation] = useState<LatLngExpression | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showConfirmationScreen, setShowConfirmationScreen] = useState(false);
  const [orderCoordinates, setOrderCoordinates] = useState<{ pickup: LatLngExpression; destination: LatLngExpression; } | null>(null);

  // State for Code Validation
  const [deliveryCode, setDeliveryCode] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchDriverName = async () => {
        // const { data: { user } } = await supabase.auth.getUser();
        // if (user) {
        //     const { data, error } = await supabase
        //         .from('drivers')
        //         .select('full_name')
        //         .eq('id', user.id)
        //         .single();

        //     if (data && data.full_name) {
        //         setDriverName(data.full_name);
        //     } else if (user.email) {
        //         setDriverName(user.email);
        //     }
        // }
        setDriverName("Demo Driver");
    };
    fetchDriverName();
  }, [supabase]);

  useEffect(() => {
    // On component mount, read the status from localStorage to persist state across refreshes.
    const savedStatus = localStorage.getItem('driverIsOnline');
    if (savedStatus) {
      try {
        setIsOnline(JSON.parse(savedStatus));
      } catch (e) {
        console.error("Failed to parse 'driverIsOnline' from localStorage", e);
      }
    }
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  const fetchAndStartJob = useCallback(async (jobId: string) => {
    setIsLoadingJob(true);
    setIsOnline(true); // Show loading state on the map immediately
    console.log(`Fetching data for job ID: ${jobId}`);
    
    const { data: jobData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', jobId)
        .single();
    
    if (error || !jobData) {
        console.error('Error fetching job details:', error);
        alert("Could not load the selected job. It might have been taken by another driver. Please refresh the jobs list.");
        setIsLoadingJob(false);
        setIsOnline(false); // Go back offline if job fetch fails
        router.push('/jobs'); // Redirect back to jobs list
        return;
    }

    console.log('Job data fetched:', jobData);

    const parsePoint = (pointString: string | null): [number, number] | null => {
        if (!pointString) return null;
        const match = pointString.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
        if (match && match.length === 3) {
            return [parseFloat(match[2]), parseFloat(match[1])]; // [lat, lng]
        }
        console.warn(`Could not parse coordinates: ${pointString}`);
        return null;
    };

    const pickupCoords = parsePoint(jobData.pickup_coordinates);
    const destinationCoords = parsePoint(jobData.destination_coordinates);

    const stops: OrderStop[] = [];
    if (pickupCoords) {
        stops.push({
            id: `${jobData.id}_pickup`,
            type: 'pickup',
            address: jobData.pickup_address || 'Unknown Pickup Address',
            shortAddress: `Pickup: ${jobData.pickup_address || 'Start'}`,
            coordinates: pickupCoords,
            status: 'pending',
            sequence: 1,
            items: ['Parcel']
        });
    }

    if (destinationCoords) {
        stops.push({
            id: `${jobData.id}_dropoff`,
            type: 'dropoff',
            address: jobData.destination_address || 'Unknown Destination Address',
            shortAddress: `Dropoff: ${jobData.destination_address || 'End'}`,
            coordinates: destinationCoords,
            status: 'pending',
            sequence: 2,
            customerName: 'Customer' // Placeholder
        });
    }

    if (stops.length > 0) {
        const newDelivery: DeliveryBatch = {
            id: jobData.id.toString(),
            label: jobData.title || `Delivery #${jobData.id.toString().substring(0, 4)}`,
            stops: stops,
            estimatedTotalTime: jobData.time || 'N/A',
            estimatedTotalDistance: jobData.distance || 'N/A',
        };
        
        const initialStatuses: Record<string, OrderStop['status']> = {};
        newDelivery.stops.forEach(stop => {
            initialStatuses[stop.id] = stop.status;
        });
        
        setCurrentDelivery(newDelivery);
        setStopStatuses(initialStatuses);
        setCurrentStopIndex(0);
        setActiveJobId(jobId);
        setShowConfirmationScreen(false);
        localStorage.setItem('driverIsOnline', JSON.stringify(true));
    } else {
       console.error("Failed to create stops from job data, coordinates might be missing.");
       alert("Job data is incomplete and cannot be started.");
       setIsOnline(false);
    }

    setIsLoadingJob(false);
  }, [supabase, router]);


  useEffect(() => {
    const autoStartParam = searchParams.get('autoStartDelivery');
    const jobIdFromParams = searchParams.get('jobId');

    // Only run if the params are present and there's no active delivery
    if (autoStartParam === 'true' && jobIdFromParams && !currentDelivery) {
      fetchAndStartJob(jobIdFromParams);
      // Clean up URL to prevent re-triggering on refresh
      const newPath = pathname; 
      router.replace(newPath, undefined); 
    }
  }, [searchParams, currentDelivery, fetchAndStartJob, router, pathname]);


  useEffect(() => {
    const pLat = searchParams.get('pickupLat');
    const pLng = searchParams.get('pickupLng');
    const dLat = searchParams.get('destLat');
    const dLng = searchParams.get('destLng');

    if (pLat && pLng && dLat && dLng) {
        setOrderCoordinates({
            pickup: [parseFloat(pLat), parseFloat(pLng)],
            destination: [parseFloat(dLat), parseFloat(dLng)],
        });
        const newPath = pathname;
        router.replace(newPath, undefined);
    }
  }, [searchParams, router, pathname]);


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
    // This effect now only handles the "Go Offline" case
    if (!isOnline) {
      setCurrentDelivery(null);
      setActiveJobId(null);
      setStopStatuses({});
      setCurrentStopIndex(0);
      setShowConfirmationScreen(false);
    }
  }, [isOnline]);

  const currentStop = useMemo(() => {
    if (!currentDelivery) return null;
    return currentDelivery.stops[currentStopIndex];
  }, [currentDelivery, currentStopIndex]);

  const handleToggleOnline = (checked: boolean) => {
    setIsOnline(checked);
    localStorage.setItem('driverIsOnline', JSON.stringify(checked));
  };

  const handleStatusUpdate = async () => {
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
           setShowConfirmationScreen(true);
           setValidationStatus('idle');
           setDeliveryCode('');
           return; 
        }
        break;
    }
    
    if (nextStatus) {
      setStopStatuses(prev => ({ ...prev, [currentStop.id]: nextStatus! }));
      
      if (nextStatus === 'picked_up') {
        if (activeJobId) {
          console.log(`Updating job ${activeJobId} status to 'delivering'`);
          const { error } = await supabase
            .from('orders')
            .update({ status: 'delivering' })
            .eq('id', activeJobId);

          if (error) {
            console.error('Error updating job status to delivering:', error.message);
          }
        }

        if (currentStopIndex < currentDelivery.stops.length - 1) {
          setCurrentStopIndex(prev => prev + 1);
        } else {
          console.log('Batch completed!');
          setCurrentDelivery(null); 
          setActiveJobId(null);
        }
      }
    }
  };


  const handleCodeVerification = async () => {
    if (!currentDelivery || !currentStop) return;
    
    setValidationStatus('loading');
    
    // Simulate API call
    setTimeout(async () => {
      if (deliveryCode === CORRECT_DELIVERY_CODE) {
        setValidationStatus('success');

        if (activeJobId) {
          console.log(`Updating job ${activeJobId} status to 'delivered'`);
          const { error } = await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', activeJobId);

          if (error) {
            console.error('Error updating job status to delivered:', error.message);
          }
        }
        
        setTimeout(() => {
          // Update status and move to next stop
          setStopStatuses(prev => ({ ...prev, [currentStop.id]: 'delivered' }));
          setShowConfirmationScreen(false);
          setDeliveryCode('');
          setValidationStatus('idle');
          
          if (currentStopIndex < currentDelivery.stops.length - 1) {
            setCurrentStopIndex(prev => prev + 1);
          } else {
            console.log('Batch completed!');
            setCurrentDelivery(null);
            setActiveJobId(null);
          }
        }, 1500); // Show success message for a bit

      } else {
        setValidationStatus('error');
      }
    }, 1000);
  };

  const getActionButtonConfig = () => {
    if (!currentStop) return { text: 'Loading...', disabled: true, action: () => {} };
    const status = stopStatuses[currentStop.id];

    if (showConfirmationScreen) {
        return { 
          text: 'Verify and Complete Delivery', 
          disabled: deliveryCode.length !== 6 || validationStatus === 'loading' || validationStatus === 'success', 
          action: handleCodeVerification, 
          icon: CheckCircle2Icon 
        };
    }

    switch (currentStop.type) {
      case 'pickup':
        if (status === 'pending') return { text: 'Arrived at Pickup', disabled: !driverLocation, action: handleStatusUpdate, icon: NavigationIcon };
        if (status === 'arrived_at_pickup') return { text: 'Confirm Pickup', disabled: false, action: handleStatusUpdate, icon: TruckIcon };
        if (status === 'picked_up') return { text: 'Pickup Complete', disabled: true, action: () => {}, icon: CheckCircle2Icon };
        break;
      case 'dropoff':
        if (status === 'pending') return { text: 'Arrived at Dropoff', disabled: !driverLocation, action: handleStatusUpdate, icon: NavigationIcon };
        if (status === 'arrived_at_dropoff') return { text: 'Confirm Delivery', disabled: false, action: handleStatusUpdate, icon: PackageIcon };
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
    return "Njila";
  }, [isOnline, currentDelivery, currentStop]);


  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary truncate flex-1">
            {headerTitle === "Njila" && <HomeIcon className="inline-block mr-2 h-6 w-6 align-text-bottom" />}
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
        <div className="flex flex-col md:flex-row md:group" style={{ height: 'calc(100vh - 8rem)'}}>
          <div className="bg-muted relative h-1/2 md:h-full md:w-2/3 transition-all duration-300 ease-in-out md:group-hover:w-1/2">
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
              orderCoordinates={orderCoordinates}
            />
             {!gpsError && !driverLocation && ( 
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/80 z-20">
                <NavigationIcon className="w-8 h-8 mr-2 animate-pulse" /> Acquiring GPS signal...
              </div>
            )}
          </div>

          <div className="bg-background shadow-t-lg flex h-1/2 md:h-full md:w-1/3 flex-col overflow-hidden transition-all duration-300 ease-in-out md:group-hover:w-1/2">
            {showConfirmationScreen && currentStop ? (
              <Card className="m-2 flex-grow overflow-y-auto shadow-none border-none rounded-none">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base flex items-center">
                    <PackageIcon className="mr-2 h-5 w-5 text-primary" />
                    Confirm Delivery: {currentStop.shortAddress}
                  </CardTitle>
                  <CardDescription className="text-xs pt-1">To: {currentStop.customerName || 'Customer'}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4 text-sm flex flex-col items-center">
                  <label htmlFor="delivery-code" className="text-sm font-medium text-foreground text-center">
                    Enter the 6-digit code from the customer
                  </label>
                  <div className="flex flex-col items-center space-y-4">
                    <InputOTP
                      maxLength={6}
                      value={deliveryCode}
                      onChange={(value) => {
                        setDeliveryCode(value);
                        setValidationStatus('idle'); // Reset validation on change
                      }}
                      disabled={validationStatus === 'loading' || validationStatus === 'success'}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>

                    {validationStatus === 'success' && (
                       <div className="flex items-center text-green-600 font-semibold text-center">
                         <CheckCircle2Icon className="h-5 w-5 mr-2 animate-pulse" /> Delivery Confirmed!
                       </div>
                    )}
                    {validationStatus === 'error' && (
                       <div className="flex items-center text-red-600 font-semibold text-center">
                         <XCircleIcon className="h-5 w-5 mr-2" /> Invalid code. Please try again.
                       </div>
                    )}
                     {validationStatus === 'loading' && (
                       <div className="flex items-center text-muted-foreground font-semibold text-center">
                         <NavigationIcon className="h-5 w-5 mr-2 animate-spin" /> Verifying...
                       </div>
                    )}
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
            <DynamicMapDisplay 
                driverLocation={driverLocation} 
                orderCoordinates={orderCoordinates}
            />
          </div>
          <main className="absolute top-0 left-0 right-0 bottom-0 p-4 overflow-y-auto space-y-4 z-10 flex items-center justify-center">
            <Card className="shadow-lg rounded-lg bg-card/95 backdrop-blur-sm w-full max-w-sm">
              <CardContent className="pt-6">
                {isOnline ? (
                   isLoadingJob ?
                   <div className="flex items-center justify-center text-muted-foreground">
                        <RefreshCwIcon className="w-5 h-5 mr-2 animate-spin" /> Loading your delivery...
                   </div> :
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
                 {isOnline && !isLoadingJob && !gpsError && !driverLocation && ( 
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
