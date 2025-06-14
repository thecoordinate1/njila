// src/lib/actions.ts
"use server";

import { optimizeDeliveryRoute, type OptimizeDeliveryRouteInput, type OptimizeDeliveryRouteOutput } from "@/ai/flows/optimize-delivery-route";
import type { Order } from "@/types";

interface OptimizeRouteActionResult {
  success: boolean;
  data?: OptimizeDeliveryRouteOutput;
  error?: string;
}

export async function handleOptimizeDeliveryRoute(
  orders: Pick<Order, 'orderId' | 'pickupAddress' | 'deliveryAddress'>[],
  vehicleType: 'car' | 'bike'
): Promise<OptimizeRouteActionResult> {
  if (!orders || orders.length === 0) {
    return { success: false, error: "No orders provided for optimization." };
  }

  const input: OptimizeDeliveryRouteInput = {
    orders: orders.map(order => ({
      orderId: order.orderId,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
    })),
    vehicleType,
  };

  try {
    const result = await optimizeDeliveryRoute(input);
    if (!result || !result.optimizedRoute || result.optimizedRoute.length === 0) {
        // Check if all input orders are present in the optimized route
        const allOrdersIncluded = orders.every(o => result.optimizedRoute.includes(o.orderId));
        if (!allOrdersIncluded && orders.length > 0) { // Ensure there were orders to begin with
             console.warn("AI did not include all orders in the optimized route. This might be a model limitation or a too-complex request for the current prompt.");
             // Potentially return a partial success or a specific error message.
             // For now, let's allow it but log a warning.
        } else if (result.optimizedRoute.length === 0 && orders.length > 0) {
            return { success: false, error: "AI returned an empty route. Please try again." };
        }
    }
    return { success: true, data: result };
  } catch (e) {
    console.error("Error optimizing delivery route:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during route optimization.";
    return { success: false, error: errorMessage };
  }
}
