
'use client';

import type { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle2, Truck, Edit3, ShieldAlertIcon, DollarSignIcon, TrendingUpIcon, CalendarDaysIcon, RefreshCwIcon, LogOutIcon, BriefcaseBusiness } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile({
            ...data,
            email: user.email,
            member_since: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null,
          });
          setProfileExists(true);
        } else {
          if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is expected.
            console.error('Error fetching profile:', error);
          }
          setProfile({
            full_name: user.user_metadata?.full_name || 'New Driver',
            email: user.email,
            phone: null,
            vehicle_model: null,
            license_plate: null,
            insurance_verified: false,
            emergency_contact_name: null,
            emergency_contact_phone: null,
            member_since: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null,
          });
          setProfileExists(false);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase, router]);
  
  const handleRegisterDriver = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('drivers').insert({ 
        id: user.id, 
        email: user.email, 
        full_name: user.user_metadata?.full_name 
      });

      if (error) {
        console.error('Error creating driver profile:', error.message);
        setLoading(false);
        // You could add a user-facing error message here
      } else {
        // Success! router.refresh() re-runs the useEffect to get the new profile data.
        router.refresh(); 
      }
    } else {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

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
              {profileExists ? (
                <>
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
                </>
              ) : (
                <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <BriefcaseBusiness className="mx-auto h-12 w-12 text-primary mb-3" />
                  <h3 className="text-lg font-semibold text-accent-foreground">Complete Your Registration</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Click the button below to register as a driver and get full access to job listings and features.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t">
              {profileExists ? (
                <Button className="w-full" variant="outline">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              ) : (
                <Button className="w-full" onClick={handleRegisterDriver} disabled={loading}>
                  <BriefcaseBusiness className="mr-2 h-4 w-4" /> Register as a Driver
                </Button>
              )}
            </CardFooter>
          </Card>

          {profileExists && (
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
          )}

          <Button variant="destructive" className="w-full" size="lg" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-5 w-5" /> Log Out
          </Button>

        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default ProfilePage;
