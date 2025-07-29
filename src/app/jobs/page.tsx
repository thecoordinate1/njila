
'use client';

import type { NextPage } from 'next';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavbar from '@/components/BottomNavbar';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCwIcon,
  FilterIcon,
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  PackageCheckIcon,
  BriefcaseIcon,
  RouteIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import axios from 'axios';

interface Job {
  id: string;
  title: string;
  distance: string;
  time: string;
  stops: number;
  payout: number;
  currency: string;
  pickupAddress: string;
  destinationAddress: string;
}

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

const reverseGeocode = async (coords: [number, number]): Promise<string> => {
  if (!ORS_API_KEY || ORS_API_KEY === 'YOUR_OPENROUTESERVICE_API_KEY_HERE') {
      console.warn('OpenRouteService API key is missing. Cannot reverse geocode.');
      return 'Address unavailable';
  }
  const [lat, lon] = coords;
  const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lon=${lon}&point.lat=${lat}&size=1&layers=address`;
  try {
    const response = await axios.get(url);
    const addressLabel = response.data?.features?.[0]?.properties?.label;
    return addressLabel || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return 'Could not fetch address';
  }
};

const parsePoint = (pointString: string | null): [number, number] | null => {
    if (!pointString) return null;
    const match = pointString.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (match && match.length === 3) {
        return [parseFloat(match[2]), parseFloat(match[1])]; // [lat, lng]
    }
    console.warn(`Could not parse coordinates: ${pointString}`);
    return null;
};

const JobsPage: NextPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Confirmed')
      .eq('delivery_type', 'courier');

    if (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } else if (data) {
        console.log('Supabase jobs fetch successful. Data:', data);
        const jobsWithGeocodingPromises = data.map(async (job: any) => {
            const pickupCoords = parsePoint(job.pickup_coordinates);
            const destinationCoords = parsePoint(job.destination_coordinates);

            let pickupAddress = job.pickup_address || 'Fetching address...';
            if (pickupCoords && !job.pickup_address) {
                pickupAddress = await reverseGeocode(pickupCoords);
            }
            
            let destinationAddress = job.destination_address || 'Fetching address...';
            if (destinationCoords && !job.destination_address) {
                destinationAddress = await reverseGeocode(destinationCoords);
            }

            return {
                id: job.id.toString(),
                title: job.title,
                distance: job.distance,
                time: job.time,
                stops: job.stops,
                payout: job.delivery_cost,
                currency: job.currency,
                pickupAddress,
                destinationAddress
            };
        });

        const formattedJobs = await Promise.all(jobsWithGeocodingPromises);
        setJobs(formattedJobs);
    } else {
        setJobs([]);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRefreshJobs = () => {
    fetchJobs();
  };

  const handleAcceptJob = async (jobId: string) => {
    setIsAccepting(jobId);
    console.log(`Accepted job: ${jobId}`);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User is not authenticated. Cannot accept job.");
      setIsAccepting(null);
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'driving picking up', driver_id: user.id })
      .eq('id', jobId)
      .select();

    if (error) {
      console.error('Error updating job status:', error.message);
      if (error.message.includes('violates row-level security policy')) {
        console.error("RLS Policy Violation: This job may have been taken by another driver.");
      }
      setIsAccepting(null);
      return;
    }

    router.push(`/?autoStartDelivery=true&jobId=${jobId}`);
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    if (currencyCode === 'ZMW') {
      return `K${amount.toFixed(2)}`;
    }
    
    const safeCurrencyCode = currencyCode || 'USD';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: safeCurrencyCode,
      }).format(amount);
    } catch (e) {
      return `$${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Available Jobs</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="border-primary/50 text-primary hover:bg-primary/10">
              <FilterIcon className="h-5 w-5" />
              <span className="sr-only">Filter Jobs</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshJobs}
              disabled={isLoading}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <RefreshCwIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh Jobs</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 pb-32 space-y-6">
        {isLoading ? (
            <div className="text-center py-16">
              <RefreshCwIcon className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg text-muted-foreground">Loading available jobs...</p>
            </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg bg-card">
              <CardHeader className="pb-3 pt-5 px-5 bg-muted/20 border-b">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-primary">{job.title}</CardTitle>
                  <span className="text-xs font-medium text-foreground/80 bg-muted px-2.5 py-1 rounded-full border">
                    {job.stops} Stop{job.stops > 1 ? 's' : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-4 px-5 space-y-3">
                <div className="flex items-start text-sm text-muted-foreground">
                  <MapPinIcon className="h-4 w-4 mr-2 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <p><strong className="text-foreground/90">Pickup:</strong> {job.pickupAddress}</p>
                    <p><strong className="text-foreground/90">Destination:</strong> {job.destinationAddress}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <RouteIcon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                    <span>{job.distance}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <ClockIcon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                    <span>{job.time}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-accent-foreground flex items-center">
                    <DollarSignIcon className="h-5 w-5 mr-1.5 text-accent flex-shrink-0" />
                    Est. Payout: <span className="text-accent ml-1">{formatCurrency(job.payout, job.currency)}</span>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4 border-t">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  onClick={() => handleAcceptJob(job.id)}
                  disabled={isAccepting !== null}
                >
                  {isAccepting === job.id ? (
                    <RefreshCwIcon className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <PackageCheckIcon className="mr-2 h-5 w-5" />
                  )}
                  {isAccepting === job.id ? 'Accepting...' : 'Accept Job'}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 rounded-lg bg-card shadow-sm mt-8">
            <BriefcaseIcon className="mx-auto h-16 w-16 text-muted-foreground/70 mb-5" />
            <h3 className="text-2xl font-semibold mb-2 text-foreground/90">No Jobs Available</h3>
            <p className="text-sm text-muted-foreground px-4">
              Check back soon or try refreshing the list. If you believe there should be jobs, check the browser console for errors.
            </p>
            <Button variant="outline" onClick={handleRefreshJobs} className="mt-6">
                <RefreshCwIcon className="mr-2 h-4 w-4" /> Refresh Now
            </Button>
          </div>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default JobsPage;
