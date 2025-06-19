
'use client';

import type { NextPage } from 'next';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { HistoryIcon } from 'lucide-react';

const HistoryPage: NextPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Order History</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 pb-24 text-center">
        <Card className="w-full max-w-md p-8 shadow-lg rounded-lg">
          <CardContent className="flex flex-col items-center justify-center">
            <HistoryIcon className="w-16 h-16 text-primary mb-6" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your Past Deliveries</h2>
            <p className="text-muted-foreground">
              Completed and past order details will appear here.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              (This page is currently a placeholder)
            </p>
          </CardContent>
        </Card>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default HistoryPage;
