
'use client';

import type { NextPage } from 'next';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle2, Truck, Edit3, ShieldAlertIcon, DollarSignIcon, TrendingUpIcon, CalendarDaysIcon } from 'lucide-react';
import Image from 'next/image';

const ProfilePage: NextPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-24">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="bg-muted/50 p-6 flex flex-col items-center text-center">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary mb-4">
                <Image
                  src="https://placehold.co/200x200.png"
                  alt="User Avatar"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="user avatar"
                />
              </div>
              <CardTitle className="text-2xl">Alex Ryder</CardTitle>
              <CardDescription className="text-sm">alex.ryder@example.com</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
                  <UserCircle2 className="mr-2 h-5 w-5" /> Personal Information
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Full Name:</strong> Alex Johnson Ryder</p>
                  <p><strong className="text-foreground">Phone:</strong> (555) 123-4567</p>
                  <p><strong className="text-foreground">Member Since:</strong> January 15, 2022</p>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
                  <Truck className="mr-2 h-5 w-5" /> Vehicle Details
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Vehicle Model:</strong> Honda Civic</p>
                  <p><strong className="text-foreground">License Plate:</strong> XYZ 123</p>
                  <p><strong className="text-foreground">Insurance Verified:</strong> Yes</p>
                </div>
              </div>
               <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
                  <ShieldAlertIcon className="mr-2 h-5 w-5" /> Emergency Contact
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Name:</strong> Jane Doe</p>
                  <p><strong className="text-foreground">Relationship:</strong> Spouse</p>
                  <p><strong className="text-foreground">Phone:</strong> (555) 987-6543</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t">
              <Button className="w-full" variant="outline">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden shadow-md">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-semibold flex items-center text-primary">
                <DollarSignIcon className="mr-2 h-6 w-6" /> Earnings Summary
              </CardTitle>
              <CardDescription>Your recent earnings activity.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                <div className="flex items-center">
                  <CalendarDaysIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">This Week:</span>
                </div>
                <span className="font-semibold text-accent-foreground">$250.75</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                 <div className="flex items-center">
                  <CalendarDaysIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Last Week:</span>
                </div>
                <span className="font-semibold text-accent-foreground">$480.50</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                 <div className="flex items-center">
                  <TrendingUpIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Total Earned:</span>
                </div>
                <span className="font-semibold text-accent-foreground">$5,820.00</span>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t">
              <Button className="w-full" variant="outline">
                View Payout History
              </Button>
            </CardFooter>
          </Card>

        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default ProfilePage;
