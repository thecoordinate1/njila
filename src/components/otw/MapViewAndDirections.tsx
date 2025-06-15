
// src/components/otw/MapViewAndDirections.tsx
"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OptimizedRouteResult, Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapIcon, ListOrdered as ListOrderedIcon, Navigation } from "lucide-react";

// Fix for default Leaflet marker icons not appearing correctly with Webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const FitBoundsToMarkers = ({ orders }: { orders: Order[] }) => {
  const map = useMap();
  React.useEffect(() => {
    if (map && orders && orders.length > 0) {
      const bounds = new L.LatLngBounds();
      let validCoordsExist = false;
      orders.forEach(order => {
        if (order.pickupCoordinates && typeof order.pickupCoordinates.lat === 'number' && typeof order.pickupCoordinates.lng === 'number') {
          bounds.extend([order.pickupCoordinates.lat, order.pickupCoordinates.lng]);
          validCoordsExist = true;
        }
        if (order.deliveryCoordinates && typeof order.deliveryCoordinates.lat === 'number' && typeof order.deliveryCoordinates.lng === 'number') {
          bounds.extend([order.deliveryCoordinates.lat, order.deliveryCoordinates.lng]);
          validCoordsExist = true;
        }
      });

      if (validCoordsExist && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
    return () => {
      // Cleanup for FitBoundsToMarkers
      // If this effect were to add layers or event listeners directly to the map instance
      // (outside of react-leaflet's declarative components),
      // they would be cleaned up here (e.g., map.off(), map.removeLayer()).
      // map.fitBounds() itself does not require specific cleanup for this simple case.
    };
  }, [orders, map]);
  return null;
};

interface MapViewAndDirectionsProps {
  routeResult: OptimizedRouteResult;
}

export function MapViewAndDirections({ routeResult }: MapViewAndDirectionsProps) {
  console.log('MapViewAndDirections rendered');
  if (!routeResult) {
    return null;
  }
  
  const { ordersInRoute, directions } = routeResult;

  const mapContainerKey = React.useMemo(() => {
    if (!ordersInRoute || ordersInRoute.length === 0) {
      return 'map-container-no-orders';
    }
    return `map-container-${ordersInRoute.map(o => o.orderId).join('-')}`;
  }, [ordersInRoute]);
  
  const defaultPosition = React.useMemo<LatLngExpression>(() => {
    const firstOrderWithPickupCoords = ordersInRoute?.find(order => 
      order.pickupCoordinates && 
      typeof order.pickupCoordinates.lat === 'number' && 
      typeof order.pickupCoordinates.lng === 'number'
    );
    
    return firstOrderWithPickupCoords 
      ? [firstOrderWithPickupCoords.pickupCoordinates.lat, firstOrderWithPickupCoords.pickupCoordinates.lng]
      : [34.0522, -118.2437]; // Default to a general location if no valid coords
  }, [ordersInRoute]);

  if (!ordersInRoute || ordersInRoute.length === 0) {
    return (
      <Card className="shadow-lg w-full mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <MapIcon className="mr-2 h-6 w-6 text-primary" />
            Route Map & Directions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No orders in the current route to display on the map.</p>
        </CardContent>
      </Card>
    );
  }

  const polylinePositions: LatLngExpression[] = [];
  ordersInRoute.forEach(order => {
    if (order.pickupCoordinates && typeof order.pickupCoordinates.lat === 'number' && typeof order.pickupCoordinates.lng === 'number') {
      polylinePositions.push([order.pickupCoordinates.lat, order.pickupCoordinates.lng]);
    }
    if (order.deliveryCoordinates && typeof order.deliveryCoordinates.lat === 'number' && typeof order.deliveryCoordinates.lng === 'number') {
      polylinePositions.push([order.deliveryCoordinates.lat, order.deliveryCoordinates.lng]);
    }
  });


  return (
    <Card className="shadow-lg w-full mt-6">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <MapIcon className="mr-2 h-6 w-6 text-primary" />
          Route Map & Directions
        </CardTitle>
        {(directions && directions.length > 0) && (
          <CardDescription>
            Visual overview of the route and step-by-step directions.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium font-headline mb-2 flex items-center">
             <Navigation className="mr-2 h-5 w-5 text-primary" />
            Map Overview
          </h3>
          <div className="rounded-md overflow-hidden border h-96 w-full">
            <MapContainer key={mapContainerKey} center={defaultPosition} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {ordersInRoute.map((order) => (
                <React.Fragment key={order.orderId}>
                  {order.pickupCoordinates && typeof order.pickupCoordinates.lat === 'number' && typeof order.pickupCoordinates.lng === 'number' && (
                    <Marker 
                      position={[order.pickupCoordinates.lat, order.pickupCoordinates.lng]}
                      icon={pickupIcon}
                    >
                      <Popup>
                        <strong>Pickup: Order {order.orderId}</strong><br />
                        {order.customerName}<br />
                        {order.pickupAddress}
                      </Popup>
                    </Marker>
                  )}
                  {order.deliveryCoordinates && typeof order.deliveryCoordinates.lat === 'number' && typeof order.deliveryCoordinates.lng === 'number' && (
                    <Marker 
                      position={[order.deliveryCoordinates.lat, order.deliveryCoordinates.lng]}
                      icon={deliveryIcon}
                    >
                      <Popup>
                        <strong>Delivery: Order {order.orderId}</strong><br />
                        {order.customerName}<br />
                        {order.deliveryAddress}
                      </Popup>
                    </Marker>
                  )}
                </React.Fragment>
              ))}
              {polylinePositions.length > 1 && <Polyline positions={polylinePositions} color="teal" weight={3} />}
              <FitBoundsToMarkers orders={ordersInRoute} />
            </MapContainer>
          </div>
        </div>

        {(directions && directions.length > 0) && (
          <div>
            <h3 className="text-lg font-medium font-headline mb-2 flex items-center">
              <ListOrderedIcon className="mr-2 h-5 w-5 text-primary" />
              Directions
            </h3>
            <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/50">
              <ol className="list-none space-y-2 text-sm">
                {directions.map((direction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary font-semibold">{index + 1}.</span>
                    <span>{direction.replace(/^Step \d+: /, '')}</span>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
