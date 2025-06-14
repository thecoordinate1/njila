// src/lib/actions.ts
"use server";

import type { Order, OptimizeDeliveryRouteOutput } from "@/types";

interface OptimizeRouteActionResult {
  success: boolean;
  data?: OptimizeDeliveryRouteOutput;
  error?: string;
}

export async function handleOptimizeDeliveryRoute(
  orders: Pick<Order, 'orderId' | 'pickupAddress' | 'deliveryAddress'>[],
  vehicleType: 'car' | 'bike' // vehicleType is kept as it's part of the form, though not used in this mock
): Promise<OptimizeRouteActionResult> {
  if (!orders || orders.length === 0) {
    return { success: false, error: "No orders provided for optimization." };
  }

  // Mocked optimization: returns orders in the sequence they were selected.
  const mockOptimizedRoute: string[] = orders.map(order => order.orderId);
  const mockTotalDistance = orders.length * 5.0; // e.g., 5 km per order
  const mockTotalTime = orders.length * 15; // e.g., 15 minutes per order

  const mockDirections: string[] = [];
  const ordersMap = new Map(orders.map(o => [o.orderId, o]));

  mockOptimizedRoute.forEach((orderId, index) => {
    const order = ordersMap.get(orderId);
    if (order) {
      mockDirections.push(`Step ${mockDirections.length + 1}: Pick up order ${order.orderId} at "${order.pickupAddress}".`);
      mockDirections.push(`Step ${mockDirections.length + 1}: Deliver order ${order.orderId} to "${order.deliveryAddress}".`);
    }
  });

  const mockData: OptimizeDeliveryRouteOutput = {
    optimizedRoute: mockOptimizedRoute,
    totalDistance: mockTotalDistance,
    totalTime: mockTotalTime,
    directions: mockDirections,
  };

  // Simulate a short delay
  await new Promise(resolve => setTimeout(resolve, 500)); 

  return { success: true, data: mockData };
}
