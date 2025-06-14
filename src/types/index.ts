// src/types/index.ts

export interface Order {
  orderId: string;
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  items: string[];
  pickupCoordinates: { lat: number; lng: number };
  deliveryCoordinates: { lat: number; lng: number };
}

export type VehicleType = 'car' | 'bike';

export type OrderStatus = 'Pending' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed';

export type OptimizeDeliveryRouteOutput = {
  optimizedRoute: string[];
  totalDistance: number;
  totalTime: number;
  directions: string[];
};

export type OptimizedRouteResult = OptimizeDeliveryRouteOutput & {
  ordersInRoute: Order[]; // To easily access full order details
};
