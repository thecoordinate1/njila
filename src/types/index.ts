// import type { OptimizeDeliveryRouteOutput } from '@/ai/flows/optimize-delivery-route'; // Removed AI import

export interface Order {
  orderId: string;
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  items: string[];
}

export type VehicleType = 'car' | 'bike';

export type OrderStatus = 'Pending' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed';

// Define OptimizeDeliveryRouteOutput directly as the AI flow file is removed
export type OptimizeDeliveryRouteOutput = {
  optimizedRoute: string[];
  totalDistance: number;
  totalTime: number;
};

export type OptimizedRouteResult = OptimizeDeliveryRouteOutput & {
  ordersInRoute: Order[]; // To easily access full order details
};
