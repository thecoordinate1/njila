// src/components/otw/OrderCard.tsx
"use client";

import type { Order } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapPin, Package as PackageIcon } from "lucide-react";

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onSelectOrder: (orderId: string, isSelected: boolean) => void;
  showCheckbox?: boolean;
}

export function OrderCard({ order, isSelected, onSelectOrder, showCheckbox = true }: OrderCardProps) {
  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === 'boolean') {
      onSelectOrder(order.orderId, checked);
    }
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-lg font-headline">
              <PackageIcon className="mr-2 h-5 w-5 text-primary" />
              Order ID: {order.orderId}
            </CardTitle>
            <CardDescription>Customer: {order.customerName}</CardDescription>
          </div>
          {showCheckbox && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`select-${order.orderId}`}
                checked={isSelected}
                onCheckedChange={handleCheckboxChange}
                aria-label={`Select order ${order.orderId}`}
              />
              <Label htmlFor={`select-${order.orderId}`} className="text-sm font-medium">Select</Label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start space-x-2">
          <MapPin className="h-5 w-5 mt-1 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Pickup:</p>
            <p className="text-sm text-muted-foreground">{order.pickupAddress}</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <MapPin className="h-5 w-5 mt-1 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Delivery:</p>
            <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Items:</p>
          <ul className="list-disc list-inside pl-1">
            {order.items.map((item, index) => (
              <li key={index} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
