
'use client';

import type { NextPage } from 'next';
import { useState, useEffect, useCallback } from 'react';
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

interface Job {
  id: string;
  title: string;
  distance: string;
  time: string;
  stops: number;
  payout: number;
  currency: string;
  pickupAddress: string;
}

const JobsPage: NextPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const router = useRouter(); 
  const supabase = createClient();

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending');

    if (error) {
      console.error('Error fetching jobs:', error.message);
      setJobs([]);
    } else if (data) {
      const formattedJobs = data.map((job: any) => ({
        id: job.id.toString(),
        title: job.title,
        distance: job.distance,
        time: job.time,
        stops: job.stops,
        payout: job.payout,
        currency: job.currency,
        pickupAddress: job.pickup_address,
      }));
      setJobs(formattedJobs);
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

    const { error } = await supabase
      .from('orders')
      .update({ status: 'in_progress' })
      .eq('id', jobId);

    if (error) {
      console.error('Error updating job status:', error.message);
      // Optionally, add user feedback here (e.g., a toast)
      setIsAccepting(null);
      return;
    }

    router.push(`/?autoStartDelivery=true&jobId=${jobId}`);
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
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

      <main className="flex-grow p-4 md:p-6 pb-24 space-y-6">
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
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPinIcon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <span><strong className="text-foreground/90">Pickup:</strong> {job.pickupAddress}</span>
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
              Check back soon or try refreshing the list.
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
    
