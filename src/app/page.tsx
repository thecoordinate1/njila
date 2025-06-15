
// src/app/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import type { Order, VehicleType, OrderStatus, OptimizedRouteResult } from "@/types";
import { OrderList } from "@/components/otw/OrderList";
import { RouteOptimizationForm } from "@/components/otw/RouteOptimizationForm";
import { OptimizedRouteDisplay } from "@/components/otw/OptimizedRouteDisplay";
import { handleOptimizeDeliveryRoute } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, ListChecks, RouteIcon as RouteIconLucide } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const MapViewAndDirections = dynamic(() =>
  import('@/components/otw/MapViewAndDirections').then(mod => mod.MapViewAndDirections),
  { ssr: false, loading: () => <p>Loading map...</p> }
);


const mockOrders: Order[] = [
  { orderId: "ORD001", pickupAddress: "123 Main St, Anytown, USA", deliveryAddress: "456 Oak Ave, Anytown, USA", customerName: "Alice Smith", items: ["Pizza", "Soda"], pickupCoordinates: { lat: 34.0522, lng: -118.2437 }, deliveryCoordinates: { lat: 34.0530, lng: -118.2445 } },
  { orderId: "ORD002", pickupAddress: "789 Pine Ln, Anytown, USA", deliveryAddress: "101 Maple Dr, Anytown, USA", customerName: "Bob Johnson", items: ["Groceries"], pickupCoordinates: { lat: 34.0540, lng: -118.2450 }, deliveryCoordinates: { lat: 34.0550, lng: -118.2460 } },
  { orderId: "ORD003", pickupAddress: "234 Birch Rd, Anytown, USA", deliveryAddress: "567 Cedar Cres, Anytown, USA", customerName: "Carol Williams", items: ["Documents"], pickupCoordinates: { lat: 34.0560, lng: -118.2470 }, deliveryCoordinates: { lat: 34.0570, lng: -118.2480 } },
  { orderId: "ORD004", pickupAddress: "890 Elm St, Anytown, USA", deliveryAddress: "112 Willow Way, Anytown, USA", customerName: "David Brown", items: ["Flowers", "Chocolates"], pickupCoordinates: { lat: 34.0580, lng: -118.2490 }, deliveryCoordinates: { lat: 34.0590, lng: -118.2500 } },
  { orderId: "ORD005", pickupAddress: "321 Spruce Ave, Anytown, USA", deliveryAddress: "654 Aspen Ct, Anytown, USA", customerName: "Eve Davis", items: ["Electronics"], pickupCoordinates: { lat: 34.0600, lng: -118.2510 }, deliveryCoordinates: { lat: 34.0610, lng: -118.2520 } },
];

export default function Home() {
  console.log('Home component (page.tsx) rendered');
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [optimizedRouteResult, setOptimizedRouteResult] = useState<OptimizedRouteResult | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, OrderStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setAvailableOrders(mockOrders);
    const initialStatuses: Record<string, OrderStatus> = {};
    mockOrders.forEach(order => {
      initialStatuses[order.orderId] = 'Pending';
    });
    setOrderStatuses(initialStatuses);
  }, []);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


  const handleSelectOrder = (orderId: string, isSelected: boolean) => {
    setSelectedOrderIds(prev =>
      isSelected ? [...prev, orderId] : prev.filter(id => id !== orderId)
    );
  };

  const handleOptimizeRoute = async () => {
    if (selectedOrderIds.length === 0) {
      toast({ title: "No Orders Selected", description: "Please select orders to optimize.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setOptimizedRouteResult(null); 

    const ordersToOptimize = availableOrders.filter(order => selectedOrderIds.includes(order.orderId))
      .map(({ orderId, pickupAddress, deliveryAddress, customerName, items, pickupCoordinates, deliveryCoordinates }) => ({ orderId, pickupAddress, deliveryAddress, customerName, items, pickupCoordinates, deliveryCoordinates }));

    const result = await handleOptimizeDeliveryRoute(ordersToOptimize, vehicleType);
    setIsLoading(false);

    if (result.success && result.data) {
      const ordersInRouteMap = new Map(availableOrders.map(o => [o.orderId, o]));
      const fullOrdersInRoute = result.data.optimizedRoute
        .map(id => ordersInRouteMap.get(id))
        .filter((o): o is Order => o !== undefined);

      setOptimizedRouteResult({ ...result.data, ordersInRoute: fullOrdersInRoute });
      toast({ title: "Route Optimized", description: "The delivery route has been successfully optimized." });
    } else {
      toast({ title: "Optimization Failed", description: result.error || "An unknown error occurred.", variant: "destructive" });
    }
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    setOrderStatuses(prev => ({ ...prev, [orderId]: status }));
  };
  
  const handleReset = () => {
    setSelectedOrderIds([]);
    setOptimizedRouteResult(null);
    setVehicleType('car');
    const initialStatuses: Record<string, OrderStatus> = {};
    availableOrders.forEach(order => {
      initialStatuses[order.orderId] = 'Pending';
    });
    setOrderStatuses(initialStatuses);
    toast({ title: "Selection Reset", description: "Selections and optimized route have been cleared." });
  };

  const mapViewKey = optimizedRouteResult ? optimizedRouteResult.optimizedRoute.join('-') : 'no-route';

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-light-teal font-body">
      <header className="w-full max-w-6xl mb-8 text-center">
        <div className="flex items-center justify-center space-x-2">
            <svg viewBox="0 0 100 100" className="h-16 w-16 text-primary" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M85,40 C85,25 75,10 60,10 C45,10 40,20 40,20 C40,20 35,10 20,10 C5,10 -5,25 -5,40 C-5,65 40,90 40,90 C40,90 85,65 85,40 Z M60,30 C60,30 65,20 70,20 C75,20 75,25 75,30 C75,40 60,50 60,50 C60,50 60,40 60,30 Z M20,30 C20,30 20,20 30,20 C30,20 30,25 30,30 C30,40 20,50 20,50 C20,50 20,40 20,30 Z" transform="translate(10,0)"/>
            </svg>
           <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">OTW - On The Way</h1>
        </div>
        <p className="text-muted-foreground mt-2 text-lg">Efficient Delivery Route Planning</p>
      </header>

      {isLoading && (
        <div className="w-full max-w-md my-4">
          <Progress value={undefined} className="animate-pulse h-2" />
          <p className="text-center text-primary mt-2">Optimizing your route, please wait...</p>
        </div>
      )}

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-headline font-semibold text-primary flex items-center">
              <ListChecks className="mr-2 h-7 w-7" />Available Orders
            </h2>
             <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Selections
            </Button>
          </div>
          <OrderList
            orders={availableOrders}
            selectedOrderIds={selectedOrderIds}
            onSelectOrder={handleSelectOrder}
          />
        </section>

        <section className="space-y-6">
           <h2 className="text-2xl font-headline font-semibold text-primary flex items-center">
              <RouteIconLucide className="mr-2 h-7 w-7" />Route Planner
            </h2>
          <RouteOptimizationForm
            vehicleType={vehicleType}
            onVehicleTypeChange={setVehicleType}
            onOptimizeRoute={handleOptimizeRoute}
            isLoading={isLoading}
            selectedOrderCount={selectedOrderIds.length}
          />
          {optimizedRouteResult && (
            <>
              <OptimizedRouteDisplay
                routeResult={optimizedRouteResult}
                orderStatuses={orderStatuses}
                onUpdateStatus={handleUpdateStatus}
              />
              <Suspense fallback={<p>Loading map and directions...</p>}>
                <MapViewAndDirections key={mapViewKey} routeResult={optimizedRouteResult} />
              </Suspense>
            </>
          )}
           {!optimizedRouteResult && !isLoading && (
            <Card className="shadow-lg border-dashed border-2 border-gray-300">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <Image src="https://placehold.co/300x200.png" alt="Map illustration" width={300} height={200} className="mb-4 rounded-md" data-ai-hint="map navigation" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2 font-headline">Ready to Optimize?</h3>
                <p className="text-muted-foreground">
                  Select orders from the list, choose your vehicle type, and click "Optimize Route" to see the magic happen!
                </p>
              </CardContent>
            </Card>
           )}
        </section>
      </main>
      <footer className="w-full max-w-6xl mt-12 pt-8 border-t border-gray-300 text-center">
        <p className="text-sm text-muted-foreground">
          {currentYear !== null ? `© ${currentYear} OTW App. Drive smart, deliver fast.` : 'Loading year...'}
        </p>
      </footer>
    </div>
  );
}
