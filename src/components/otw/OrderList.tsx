// src/components/otw/OrderList.tsx
"use client";

import type { Order } from "@/types";
import { OrderCard } from "./OrderCard";

interface OrderListProps {
  orders: Order[];
  selectedOrderIds: string[];
  onSelectOrder: (orderId: string, isSelected: boolean) => void;
}

export function OrderList({ orders, selectedOrderIds, onSelectOrder }: OrderListProps) {
  if (orders.length === 0) {
    return <p className="text-muted-foreground">No available orders at the moment.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.orderId}
          order={order}
          isSelected={selectedOrderIds.includes(order.orderId)}
          onSelectOrder={onSelectOrder}
        />
      ))}
    </div>
  );
}
