
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
import { HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LatLngExpression } from 'leaflet';

interface OrderHistory {
  id: string;
  pickup: string;
  destination: string;
  payout: number;
  dateCompleted: string;
  status: 'Completed' | 'Cancelled';
  pickupCoords: LatLngExpression;
  destinationCoords: LatLngExpression;
}

const orderHistoryData: OrderHistory[] = [
  { id: 'LSK-HIST-001', pickup: 'Kenneth Kaunda International Airport (LUN)', destination: 'Taj Pamodzi Hotel', payout: 185.25, dateCompleted: '2023-10-25', status: 'Completed', pickupCoords: [-15.3280, 28.4520], destinationCoords: [-15.4200, 28.2950] },
  { id: 'LSK-HIST-002', pickup: 'Intercity Bus Terminus, Dedan Kimathi Rd', destination: 'Crossroads Shopping Mall', payout: 95.00, dateCompleted: '2023-10-24', status: 'Cancelled', pickupCoords: [-15.4280, 28.2800], destinationCoords: [-15.3850, 28.3350] },
  { id: 'LSK-HIST-003', pickup: 'East Park Mall, Great East Road', destination: 'Manda Hill Shopping Mall', payout: 75.50, dateCompleted: '2023-10-23', status: 'Completed', pickupCoords: [-15.39, 28.34], destinationCoords: [-15.40, 28.31] },
  { id: 'LSK-HIST-004', pickup: 'Kamwala Market, Lusaka', destination: 'University of Zambia (UNZA)', payout: 120.00, dateCompleted: '2023-10-22', status: 'Completed', pickupCoords: [-15.43, 28.29], destinationCoords: [-15.39, 28.33] },
];


const HistoryPage: NextPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Order History</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-32">
         <div className="w-full max-w-2xl space-y-6">
              {orderHistoryData.length > 0 ? (
                orderHistoryData.map((order) => (
                  <Card key={order.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg">
                    <CardHeader className="pb-3 pt-5 px-5">
                     <div className="flex justify-between items-center mb-1">
                        <CardTitle className="text-xl font-semibold">Order #{order.id}</CardTitle>
                        {order.status && (
                          <span
                            className={cn(
                              "px-3 py-1 text-xs font-bold rounded-full",
                              order.status === 'Completed' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                              order.status === 'Cancelled' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            )}
                          >
                            {order.status}
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-xs text-muted-foreground pt-1">
                        <span className="font-medium text-foreground">From:</span> {order.pickup} <br />
                        <span className="font-medium text-foreground">To:</span> {order.destination}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 pb-4 px-5">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold text-primary">Payout: ZMW {order.payout.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Completed: {order.dateCompleted}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 rounded-lg bg-card shadow-sm">
                  <HistoryIcon className="mx-auto h-16 w-16 text-muted-foreground/70 mb-5" />
                  <h3 className="text-2xl font-semibold mb-2 text-foreground/90">No Order History</h3>
                  <p className="text-sm text-muted-foreground px-4">Completed and cancelled orders will appear here once they are processed.</p>
                </div>
              )}
            </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default HistoryPage;
