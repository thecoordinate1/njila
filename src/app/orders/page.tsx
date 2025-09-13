
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
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
import type { LatLngExpression } from 'leaflet';

interface Order {
  id: string;
  pickup: string;
  destination: string;
  payout: number;
  distance?: string;
  dateCompleted?: string;
  status?: "Completed" | "Cancelled" | "Pending";
  pickupCoords: LatLngExpression;
  destinationCoords: LatLngExpression;
}

const availableOrdersData: Order[] = [
  { id: 'LSK_ORD_1', pickup: 'Levy Junction Mall, Lusaka', destination: 'Arcades Shopping Mall, Lusaka', payout: 15.50, distance: '5.5 km', status: 'Pending', pickupCoords: [-15.4090, 28.3100], destinationCoords: [-15.3950, 28.3300] },
  { id: 'LSK_ORD_2', pickup: 'Soweto Market, Lumumba Rd, Lusaka', destination: 'Bauleni Market, Lusaka', payout: 22.00, distance: '12 km', status: 'Pending', pickupCoords: [-15.4250, 28.2700], destinationCoords: [-15.4400, 28.3500] },
  { id: 'LSK_ORD_3', pickup: 'Civic Centre, Independence Ave, Lusaka', destination: 'National Assembly of Zambia, Lusaka', payout: 12.75, distance: '3.8 km', status: 'Pending', pickupCoords: [-15.4170, 28.2810], destinationCoords: [-15.4000, 28.3050] },
];

const orderHistoryData: Order[] = [
  { id: 'LSK_HIST_1', pickup: 'Kenneth Kaunda International Airport (LUN), Lusaka', destination: 'Taj Pamodzi Hotel, Lusaka', payout: 18.25, dateCompleted: '2023-10-25', status: 'Completed', pickupCoords: [-15.3280, 28.4520], destinationCoords: [-15.4200, 28.2950] },
  { id: 'LSK_HIST_2', pickup: 'Intercity Bus Terminus, Dedan Kimathi Rd, Lusaka', destination: 'Crossroads Shopping Mall, Lusaka', payout: 9.50, dateCompleted: '2023-10-24', status: 'Cancelled', pickupCoords: [-15.4280, 28.2800], destinationCoords: [-15.3850, 28.3350] },
];

const OrdersPage: NextPage = () => {
  const router = useRouter();

  const handleAcceptOrder = (order: Order) => {
    const { pickupCoords, destinationCoords } = order;
    // Assuming Coords are [lat, lng]
    const pLat = (pickupCoords as number[])[0];
    const pLng = (pickupCoords as number[])[1];
    const dLat = (destinationCoords as number[])[0];
    const dLng = (destinationCoords as number[])[1];
    router.push(`/?pickupLat=${pLat}&pickupLng=${pLng}&destLat=${dLat}&destLng=${dLng}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold tracking-tight">Manage Orders</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-32">
        
        <Tabs defaultValue="available" className="w-full max-w-3xl">
          <TabsList className="grid w-full grid-cols-2 mb-6 shadow-sm sticky top-16 z-20 bg-muted">
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
                      <Button className="w-full" size="lg" onClick={() => handleAcceptOrder(order)}>Accept Order</Button>
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
