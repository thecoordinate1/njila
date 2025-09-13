
'use client';

import type { NextPage } from 'next';
import BottomNavbar from '@/components/BottomNavbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Driver {
  id: string;
  name: string;
  avatarUrl: string;
  status: 'Available' | 'Making delivery';
  currentOrderId?: string;
}

const driversData: Driver[] = [
  { id: 'DRV-001', name: 'John Tembo', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=JT', status: 'Available' },
  { id: 'DRV-002', name: 'Maria Phiri', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=MP', status: 'Making delivery', currentOrderId: 'ORD-002' },
  { id: 'DRV-003', name: 'David Banda', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=DB', status: 'Making delivery', currentOrderId: 'ORD-005' },
  { id: 'DRV-004', name: 'Grace Zulu', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=GZ', status: 'Available' },
  { id: 'DRV-005', name: 'Peter Mwale', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=PM', status: 'Available' },
  { id: 'DRV-006', name: 'Charity Sakala', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=CS', status: 'Making delivery', currentOrderId: 'ORD-001' },
];


const DriversPage: NextPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Driver Status</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-32">
        <div className="w-full max-w-2xl">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-3 h-6 w-6" />
                Active Drivers
              </CardTitle>
              <CardDescription>
                A real-time overview of your drivers and their current status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {driversData.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={driver.avatarUrl} alt={driver.name} data-ai-hint="driver avatar" />
                        <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{driver.name}</p>
                        {driver.status === 'Making delivery' && driver.currentOrderId ? (
                           <Link href={`/orders/${driver.currentOrderId}`} className="text-xs text-primary hover:underline">
                            View Order #{driver.currentOrderId}
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground">Ready for new orders</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        driver.status === 'Available' && 'bg-green-100 text-green-800 border-green-200',
                        driver.status === 'Making delivery' && 'bg-amber-100 text-amber-800 border-amber-200'
                      )}
                      variant="outline"
                    >
                      {driver.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default DriversPage;
