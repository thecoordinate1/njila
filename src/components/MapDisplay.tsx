
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

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
  const [routePoints, setRoutePoints] = useState<LatLngExpression[] | null>(null);
  
  const YOUR_ORS_API_KEY = '5b3ce3597851110001cf624814648d498f8945a29cb04a972a24b149'; 

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (orderCoordinates && isClient) {
      if (YOUR_ORS_API_KEY === 'YOUR_OPENROUTESERVICE_API_KEY_HERE' || YOUR_ORS_API_KEY === '') { // Keep check for placeholder if user empties it
        console.warn(
          'OpenRouteService API key is missing or is still the placeholder. Please add it to MapDisplay.tsx to fetch routes. Falling back to a straight line.'
        );
        setRoutePoints(null); // Ensure no old route is shown
        return;
      }

      const fetchRoute = async () => {
        const { pickup, destination } = orderCoordinates;
        // Ensure coordinates are [lat, lng]
        const pickupCoords = pickup as [number, number];
        const destCoords = destination as [number, number];

        // ORS expects lng,lat
        const start = `${pickupCoords[1]},${pickupCoords[0]}`;
        const end = `${destCoords[1]},${destCoords[0]}`;
        
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${YOUR_ORS_API_KEY}&start=${start}&end=${end}`;

        try {
          const response = await axios.get(url);
          if (response.data && response.data.features && response.data.features.length > 0) {
            const coordinates = response.data.features[0].geometry.coordinates;
            // ORS coordinates are [lng, lat], map to [lat, lng] for Leaflet
            const leafletCoords: LatLngExpression[] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as LatLngExpression);
            setRoutePoints(leafletCoords);
          } else {
            console.error('ORS: No route found or unexpected response format', response.data);
            setRoutePoints(null);
          }
        } catch (error) {
          console.error('Error fetching route from OpenRouteService:', error);
          setRoutePoints(null);
        }
      };

      fetchRoute();
    } else {
      setRoutePoints(null); // Clear route if no orderCoordinates or not client-side
    }
  }, [orderCoordinates, isClient, YOUR_ORS_API_KEY]);

  const defaultPosition: LatLngExpression = [51.505, -0.09];
  const defaultZoomLevel: number = 13;

  if (!isClient) {
    return null; 
  }

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
      zoom={defaultZoomLevel}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Routing by <a href="https://openrouteservice.org/">OpenRouteService</a>'
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
          {routePoints && routePoints.length > 0 ? (
            <Polyline positions={routePoints} color="green" weight={8} opacity={0.7} />
          ) : (
            // Fallback to straight dashed line if no route points (API key missing, error, or still loading)
            <Polyline positions={[orderCoordinates.pickup, orderCoordinates.destination]} color="gray" dashArray="10, 5" />
          )}
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
