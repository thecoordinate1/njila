
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icon fix
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapDisplayProps {
  orderCoordinates?: {
    pickup: LatLngExpression;
    destination: LatLngExpression;
  };
}

const OrderMapViewUpdater: React.FC<{ coords?: MapDisplayProps['orderCoordinates'] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      const bounds = L.latLngBounds([coords.pickup, coords.destination]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    // Optional: Add logic to reset to a default view if coords become undefined
    // else { map.setView([51.505, -0.09], 13); }
  }, [map, coords]);
  return null;
};

const MapDisplay: React.FC<MapDisplayProps> = ({ orderCoordinates }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultPosition: LatLngExpression = [51.505, -0.09];
  const defaultZoomLevel: number = 13;

  if (!isClient) {
    return null; 
  }

  // Determine a unique key for MapContainer to force re-initialization if orderCoordinates fundamentally change
  // This helps ensure fitBounds works correctly when navigating with new coordinates.
  const mapKey = orderCoordinates 
    ? `map-${JSON.stringify(orderCoordinates.pickup)}-${JSON.stringify(orderCoordinates.destination)}` 
    : 'default-map';

  const initialCenter = orderCoordinates 
    ? L.latLngBounds([orderCoordinates.pickup, orderCoordinates.destination]).getCenter() 
    : defaultPosition;

  return (
    <MapContainer
      key={mapKey}
      center={initialCenter}
      zoom={defaultZoomLevel} // fitBounds in OrderMapViewUpdater will adjust this
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <OrderMapViewUpdater coords={orderCoordinates} />
      {orderCoordinates ? (
        <>
          <Marker position={orderCoordinates.pickup}>
            <Popup>Pickup Location</Popup>
          </Marker>
          <Marker position={orderCoordinates.destination}>
            <Popup>Destination Location</Popup>
          </Marker>
          <Polyline positions={[orderCoordinates.pickup, orderCoordinates.destination]} color="blue" />
        </>
      ) : (
        <Marker position={defaultPosition}>
          <Popup>
            Welcome to the Map!
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapDisplay;
