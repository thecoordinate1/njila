
export interface OrderStop {
  id: string;
  type: 'pickup' | 'dropoff';
  address: string;
  shortAddress: string; // For display in list
  coordinates: [number, number]; // [lat, lng]
  status: 'pending' | 'arrived_at_pickup' | 'picked_up' | 'arrived_at_dropoff' | 'delivered' | 'failed';
  sequence: number;
  items?: string[]; // Optional: list of item names/IDs for this stop
  customerName?: string;
  contactPhone?: string;
}

export interface DeliveryBatch {
  id: string;
  label: string;
  stops: OrderStop[];
  estimatedTotalTime?: string;
  estimatedTotalDistance?: string;
}

// Example usage of LatLngExpression for Leaflet
// import type { LatLngExpression } from 'leaflet';
// const coords: LatLngExpression = [51.505, -0.09];
