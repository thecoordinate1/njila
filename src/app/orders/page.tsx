
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

interface Order {
  id: string;
  pickup: string;
  destination: string;
  payout: number;
  distance?: string; // Optional for available orders
  dateCompleted?: string; // Optional for history
  status?: "Completed" | "Cancelled" | "Pending"; // Status for history or available
}

const availableOrdersData: Order[] = [
  { id: '1', pickup: '123 Main St', destination: '456 Oak Ave', payout: 15.50, distance: '2.5 miles', status: 'Pending' },
  { id: '2', pickup: '789 Pine Ln', destination: '101 Maple Dr', payout: 22.00, distance: '5 miles', status: 'Pending' },
  { id: '3', pickup: '234 Elm Rd', destination: '567 Birch Ct', payout: 12.75, distance: '1.8 miles', status: 'Pending' },
];

const orderHistoryData: Order[] = [
  { id: 'h1', pickup: '321 Willow Way', destination: '654 Cedar Cres', payout: 18.25, dateCompleted: '2023-10-25', status: 'Completed' },
  { id: 'h2', pickup: '987 Spruce St', destination: '123 Aspen Pl', payout: 9.50, dateCompleted: '2023-10-24', status: 'Cancelled' },
];

const OrdersPage: NextPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center p-4 pb-20"> {/* pb-20 for navbar space */}
        <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
        
        <Tabs defaultValue="available" className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Orders</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
          </TabsList>
          <TabsContent value="available">
            <div className="space-y-4 mt-4">
              {availableOrdersData.length > 0 ? (
                availableOrdersData.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <CardDescription>
                        Pickup: {order.pickup} <br />
                        Destination: {order.destination}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">Payout: ${order.payout.toFixed(2)}</p>
                      {order.distance && <p className="text-sm text-muted-foreground">Distance: {order.distance}</p>}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Accept Order</Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No available orders at the moment.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="space-y-4 mt-4">
              {orderHistoryData.length > 0 ? (
                orderHistoryData.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <CardDescription>
                        Pickup: {order.pickup} <br />
                        Destination: {order.destination}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Payout: ${order.payout.toFixed(2)}</p>
                      {order.dateCompleted && <p className="text-sm">Completed: {order.dateCompleted}</p>}
                      {order.status && <p className={`text-sm font-semibold ${order.status === 'Completed' ? 'text-green-600' : order.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>Status: {order.status}</p>}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No order history found.</p>
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
