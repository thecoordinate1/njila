
'use client';

import type { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle2, Truck, Edit3, ShieldAlertIcon, DollarSignIcon, TrendingUpIcon, CalendarDaysIcon, RefreshCwIcon } from 'lucide-react';
import Image from 'next/image';

interface ProfileData {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  vehicle_model: string | null;
  license_plate: string | null;
  insurance_verified: boolean | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  member_since: string | null;
}

const ProfilePage: NextPage = () => {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setProfile({
            ...data,
            email: user.email,
            member_since: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null,
          });
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCwIcon className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

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
              <CardTitle className="text-2xl">{profile?.full_name || 'Driver Name'}</CardTitle>
              <CardDescription className="text-sm">{profile?.email || 'driver@example.com'}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
                  <UserCircle2 className="mr-2 h-5 w-5" /> Personal Information
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Full Name:</strong> {profile?.full_name || 'N/A'}</p>
                  <p><strong className="text-foreground">Phone:</strong> {profile?.phone || 'N/A'}</p>
                  <p><strong className="text-foreground">Member Since:</strong> {profile?.member_since || 'N/A'}</p>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
                  <Truck className="mr-2 h-5 w-5" /> Vehicle Details
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Vehicle Model:</strong> {profile?.vehicle_model || 'N/A'}</p>
                  <p><strong className="text-foreground">License Plate:</strong> {profile?.license_plate || 'N/A'}</p>
                  <p><strong className="text-foreground">Insurance Verified:</strong> {profile?.insurance_verified ? 'Yes' : 'No'}</p>
                </div>
              </div>
               <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
                  <ShieldAlertIcon className="mr-2 h-5 w-5" /> Emergency Contact
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Name:</strong> {profile?.emergency_contact_name || 'N/A'}</p>
                  <p><strong className="text-foreground">Relationship:</strong> Spouse</p>
                  <p><strong className="text-foreground">Phone:</strong> {profile?.emergency_contact_phone || 'N/A'}</p>
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
