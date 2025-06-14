// src/lib/actions.ts
"use server";

import type { Order, OptimizeDeliveryRouteOutput } from "@/types";

interface OptimizeRouteActionResult {
  success: boolean;
  data?: OptimizeDeliveryRouteOutput;
  error?: string;
}

// Ensure the input type matches the updated Order type which includes coordinates
export async function handleOptimizeDeliveryRoute(
  orders: Array<Pick<Order, 'orderId' | 'pickupAddress' | 'deliveryAddress' | 'pickupCoordinates' | 'deliveryCoordinates'>>,
  vehicleType: 'car' | 'bike' 
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

  mockOptimizedRoute.forEach((orderId) => {
    const order = ordersMap.get(orderId);
    if (order) {
      mockDirections.push(`Pick up order ${order.orderId} (${order.customerName}) from "${order.pickupAddress}".`);
      mockDirections.push(`Deliver order ${order.orderId} to "${order.deliveryAddress}".`);
    }
  });

  // Add a final step
  if (mockDirections.length > 0) {
    mockDirections.push("Route finished. All orders handled.");
  }


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
