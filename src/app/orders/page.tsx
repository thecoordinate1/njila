
'use client';

import type { NextPage } from 'next';
import BottomNavbar from '@/components/BottomNavbar';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ListChecksIcon, HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  pickup: string;
  destination: string;
  payout: number;
  distance?: string;
  dateCompleted?: string;
  status?: "Completed" | "Cancelled" | "Pending";
}

const availableOrdersData: Order[] = [
  { id: '1', pickup: '123 Main St, Anytown, USA', destination: '456 Oak Ave, Anytown, USA', payout: 15.50, distance: '2.5 miles', status: 'Pending' },
  { id: '2', pickup: '789 Pine Ln, Otherville, USA', destination: '101 Maple Dr, Otherville, USA', payout: 22.00, distance: '5 miles', status: 'Pending' },
  { id: '3', pickup: '234 Elm Rd, Sometown, USA', destination: '567 Birch Ct, Sometown, USA', payout: 12.75, distance: '1.8 miles', status: 'Pending' },
];

const orderHistoryData: Order[] = [
  { id: 'h1', pickup: '321 Willow Way, Villagetown, USA', destination: '654 Cedar Cres, Villagetown, USA', payout: 18.25, dateCompleted: '2023-10-25', status: 'Completed' },
  { id: 'h2', pickup: '987 Spruce St, Cityburg, USA', destination: '123 Aspen Pl, Cityburg, USA', payout: 9.50, dateCompleted: '2023-10-24', status: 'Cancelled' },
  { id: 'h3', pickup: '555 Redwood Dr, Forestville, USA', destination: '777 Sequoia Ave, Forestville, USA', payout: 30.10, dateCompleted: '2023-10-22', status: 'Completed' },
];

const OrdersPage: NextPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold tracking-tight">Manage Orders</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-24"> {/* Increased pb for navbar */}
        
        <Tabs defaultValue="available" className="w-full max-w-3xl">
          <TabsList className="grid w-full grid-cols-2 mb-6 shadow-sm sticky top-16 z-20 bg-muted"> {/* Sticky TabsList */}
            <TabsTrigger value="available" className="py-3 text-sm font-medium">Available Orders</TabsTrigger>
            <TabsTrigger value="history" className="py-3 text-sm font-medium">Order History</TabsTrigger>
          </TabsList>
          <TabsContent value="available">
            <div className="space-y-6">
              {availableOrdersData.length > 0 ? (
                availableOrdersData.map((order) => (
                  <Card key={order.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg">
                    <CardHeader className="pb-3 pt-5 px-5">
                      <div className="flex justify-between items-start mb-1">
                        <CardTitle className="text-xl font-semibold">Order #{order.id}</CardTitle>
                        {order.distance && <p className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{order.distance}</p>}
                      </div>
                      <CardDescription className="text-xs text-muted-foreground pt-1">
                        <span className="font-medium text-foreground">From:</span> {order.pickup} <br />
                        <span className="font-medium text-foreground">To:</span> {order.destination}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 pb-4 px-5">
                      <p className="text-2xl font-bold text-primary">${order.payout.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Estimated Payout</p>
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-4 border-t">
                      <Button className="w-full" size="lg">Accept Order</Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 rounded-lg bg-card shadow-sm">
                  <ListChecksIcon className="mx-auto h-16 w-16 text-muted-foreground/70 mb-5" />
                  <h3 className="text-2xl font-semibold mb-2 text-foreground/90">No Available Orders</h3>
                  <p className="text-sm text-muted-foreground px-4">Check back soon! New delivery opportunities are added regularly.</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="space-y-6">
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
                              order.status === 'Cancelled' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                              order.status === 'Pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
                        <p className="text-lg font-semibold text-primary">Payout: ${order.payout.toFixed(2)}</p>
                        {order.dateCompleted && <p className="text-xs text-muted-foreground">Completed: {order.dateCompleted}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 rounded-lg bg-card shadow-sm">
                  <HistoryIcon className="mx-auto h-16 w-16 text-muted-foreground/70 mb-5" />
                  <h3 className="text-2xl font-semibold mb-2 text-foreground/90">No Order History</h3>
                  <p className="text-sm text-muted-foreground px-4">Your completed and cancelled orders will appear here once you start delivering.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default OrdersPage;
