
'use client';

import type { NextPage } from 'next';
import { useState } from 'react';
import BottomNavbar from '@/components/BottomNavbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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

const mockJobsData: Job[] = [
  {
    id: 'JOB001',
    title: 'Downtown Express Delivery',
    distance: '5.2 km',
    time: '35 mins',
    stops: 3,
    payout: 45.0,
    currency: 'USD',
    pickupAddress: 'Kamwala Market, Stand 34',
  },
  {
    id: 'JOB002',
    title: 'Suburb Food Drop',
    distance: '12.8 km',
    time: '55 mins',
    stops: 5,
    payout: 70.5,
    currency: 'USD',
    pickupAddress: 'EastPark Mall, Entrance B',
  },
  {
    id: 'JOB003',
    title: 'Quick Pharma Run',
    distance: '2.1 km',
    time: '15 mins',
    stops: 1,
    payout: 25.0,
    currency: 'USD',
    pickupAddress: 'University Teaching Hospital Pharmacy',
  },
];

const JobsPage: NextPage = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobsData);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshJobs = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Potentially shuffle or slightly alter mock data to simulate refresh
      const shuffledJobs = [...mockJobsData].sort(() => Math.random() - 0.5);
      setJobs(shuffledJobs);
      setIsLoading(false);
    }, 1000);
  };

  const handleAcceptJob = (jobId: string) => {
    console.log(`Accepted job: ${jobId}`);
    // Here you would typically navigate to an active job screen or update state
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
        {jobs.length > 0 ? (
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
                >
                  <PackageCheckIcon className="mr-2 h-5 w-5" /> Accept Job
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 rounded-lg bg-card shadow-sm mt-8">
            <BriefcaseIcon className="mx-auto h-16 w-16 text-muted-foreground/70 mb-5" />
            <h3 className="text-2xl font-semibold mb-2 text-foreground/90">No Jobs Available</h3>
            <p className="text-sm text-muted-foreground px-4">
              {isLoading ? 'Loading jobs...' : 'Check back soon or try refreshing the list.'}
            </p>
            {!isLoading && (
               <Button variant="outline" onClick={handleRefreshJobs} className="mt-6">
                <RefreshCwIcon className="mr-2 h-4 w-4" /> Refresh Now
              </Button>
            )}
          </div>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default JobsPage;
    