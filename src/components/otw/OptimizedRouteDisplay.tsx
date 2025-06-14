// src/components/otw/OptimizedRouteDisplay.tsx
"use client";

import type { OptimizedRouteResult, Order, OrderStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, Package as PackageIcon, Clock, Milestone, CheckCircle, Truck, PackageOpen, CircleHelp, CircleX, Route } from "lucide-react";

interface OptimizedRouteDisplayProps {
  routeResult: OptimizedRouteResult;
  orderStatuses: Record<string, OrderStatus>;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const statusOptions: OrderStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Failed'];

const statusIcons: Record<OrderStatus, React.ElementType> = {
  'Pending': CircleHelp,
  'Picked Up': PackageOpen,
  'In Transit': Truck,
  'Delivered': CheckCircle,
  'Failed': CircleX,
};

const statusColors: Record<OrderStatus, string> = {
  'Pending': 'text-gray-500',
  'Picked Up': 'text-blue-500',
  'In Transit': 'text-yellow-500',
  'Delivered': 'text-green-500',
  'Failed': 'text-red-500',
};

export function OptimizedRouteDisplay({ routeResult, orderStatuses, onUpdateStatus }: OptimizedRouteDisplayProps) {
  
  const getOrderById = (orderId: string): Order | undefined => {
    return routeResult.ordersInRoute.find(o => o.orderId === orderId);
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Route className="mr-2 h-6 w-6 text-primary" />
          Optimized Delivery Route
        </CardTitle>
        <CardDescription>
          Total {routeResult.ordersInRoute.length} stops. Follow the order below for maximum efficiency.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
            <Milestone className="h-5 w-5 text-primary" />
            <p><strong>Total Distance:</strong> {routeResult.totalDistance.toFixed(2)} km</p>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
            <Clock className="h-5 w-5 text-primary" />
            <p><strong>Total Time:</strong> {routeResult.totalTime} minutes</p>
          </div>
        </div>

        <Separator />

        <h3 className="text-lg font-medium font-headline">Route Stops:</h3>
        <div className="space-y-4">
          {routeResult.optimizedRoute.map((orderId, index) => {
            const order = getOrderById(orderId);
            if (!order) return null;

            const currentStatus = orderStatuses[orderId] || 'Pending';
            const StatusIcon = statusIcons[currentStatus];

            return (
              <Card key={orderId} className="bg-background transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md flex items-center">
                      <span className={`mr-2 h-6 w-6 p-1 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold`}>
                        {index + 1}
                      </span>
                      <PackageIcon className="mr-2 h-5 w-5" />
                      Order ID: {order.orderId}
                    </CardTitle>
                    <div className={`flex items-center text-sm font-medium ${statusColors[currentStatus]}`}>
                      <StatusIcon className="mr-1 h-4 w-4" />
                      {currentStatus}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 mt-1 text-gray-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Pickup:</p>
                      <p className="text-xs text-muted-foreground">{order.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 mt-1 text-gray-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Delivery:</p>
                      <p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`status-${orderId}`} className="text-xs font-medium text-gray-700 mb-1 block">Update Status:</Label>
                    <Select
                      value={currentStatus}
                      onValueChange={(value) => onUpdateStatus(orderId, value as OrderStatus)}
                      aria-label={`Update status for order ${orderId}`}
                    >
                      <SelectTrigger id={`status-${orderId}`} className="w-full text-xs h-9">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status} className="text-xs">
                            <div className="flex items-center">
                              {React.createElement(statusIcons[status], { className: `mr-2 h-4 w-4 ${statusColors[status]}` })}
                              {status}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
