
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellDotIcon, PaletteIcon, ShieldCheckIcon, LogOutIcon, ChevronRightIcon, CreditCardIcon, HelpCircleIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const SettingsPage: NextPage = () => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };


  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold tracking-tight">App Settings</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-24">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BellDotIcon className="mr-3 h-6 w-6 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Manage how you receive updates and alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span>Push Notifications</span>
                {/* Placeholder for Switch component */}
                <Button variant="ghost" size="sm" className="text-primary">Toggle</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span>Email Notifications</span>
                <Button variant="ghost" size="sm" className="text-primary">Toggle</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Notification Sounds</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <PaletteIcon className="mr-3 h-6 w-6 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span>Dark Mode</span>
                <Button variant="ghost" size="sm" className="text-primary">Toggle</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Language</span>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">English</span>
                  <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
               <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Text Size</span>
                 <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">Normal</span>
                  <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CreditCardIcon className="mr-3 h-6 w-6 text-primary" />
                Payment & Payout
              </CardTitle>
              <CardDescription>Manage your payment methods and payout preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Manage Payment Methods</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Payout History</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
               <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Tax Information</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <ShieldCheckIcon className="mr-3 h-6 w-6 text-primary" />
                Account & Security
              </CardTitle>
              <CardDescription>Manage your account settings and security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Change Password</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Two-Factor Authentication</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Privacy Settings</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <HelpCircleIcon className="mr-3 h-6 w-6 text-primary" />
                Support
              </CardTitle>
              <CardDescription>Get help and find resources.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>FAQ</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Contact Support</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span>Terms of Service</span>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" className="w-full" size="lg" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-5 w-5" /> Log Out
          </Button>
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default SettingsPage;
