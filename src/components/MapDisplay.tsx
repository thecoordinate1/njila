
'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { LocateFixedIcon, TruckIcon, PackageIcon, NavigationIcon } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server'; 
import type { OrderStop } from '@/types/delivery';

// Icon fix for default markers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom DivIcon helper
const createCustomDivIcon = (iconComponent: React.ReactElement, isCurrent: boolean) => {
  const iconHtml = renderToStaticMarkup(iconComponent);
  return L.divIcon({
    html: `<div style="transform: scale(${isCurrent ? 1.3 : 1}); transition: transform 0.2s ease-in-out;">${iconHtml}</div>`,
    className: 'leaflet-custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28]
  });
};

const driverIcon = createCustomDivIcon(<NavigationIcon size={28} className="text-blue-500" />, false);
const pickupIcon = (isCurrent: boolean) => createCustomDivIcon(<TruckIcon size={28} className="text-blue-600 fill-blue-200" />, isCurrent);
const dropoffIcon = (isCurrent: boolean) => createCustomDivIcon(<PackageIcon size={28} className="text-green-600 fill-green-200" />, isCurrent);


interface MapDisplayProps {
  orderCoordinates?: {
    pickup: LatLngExpression;
    destination: LatLngExpression;
  };
  driverLocation?: LatLngExpression | null;
  stops?: OrderStop[];
  currentStopId?: string | null;
}

const MapUpdater: React.FC<{ 
  driverLocation?: LatLngExpression | null;
  stops?: OrderStop[];
  currentStopId?: string | null;
  routePoints?: LatLngExpression[] | null;
  orderCoordinates?: MapDisplayProps['orderCoordinates'];
}> = ({ driverLocation, stops, currentStopId, routePoints, orderCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    let boundsToFit: L.LatLngBounds | null = null;

    if (routePoints && routePoints.length > 0) {
      boundsToFit = L.latLngBounds(routePoints);
    } else if (stops && stops.length > 0) {
      const stopCoords = stops.map(s => s.coordinates as LatLngExpression);
      if (driverLocation) {
        boundsToFit = L.latLngBounds([driverLocation, ...stopCoords]);
      } else {
        boundsToFit = L.latLngBounds(stopCoords);
      }
    } else if (orderCoordinates) {
      boundsToFit = L.latLngBounds([orderCoordinates.pickup, orderCoordinates.destination]);
    } else if (driverLocation) {
        map.setView(driverLocation, 15); // Zoom into driver location if only that is available
        return;
    }


    if (boundsToFit && boundsToFit.isValid()) {
        const currentStopInstance = stops?.find(s => s.id === currentStopId);
        if (currentStopInstance && driverLocation) {
             map.fitBounds(boundsToFit, { padding: [70,70], maxZoom: 17 });
        } else {
            map.fitBounds(boundsToFit, { padding: [50, 50] });
        }
    }
  }, [map, driverLocation, stops, currentStopId, routePoints, orderCoordinates]);
  return null;
};

const RecenterButton: React.FC<{ 
  defaultPosition: LatLngExpression;
  defaultZoom: number;
  driverLocation?: LatLngExpression | null;
  stops?: OrderStop[];
  routePoints?: LatLngExpression[] | null;
  orderCoordinates?: MapDisplayProps['orderCoordinates'];
}> = ({ defaultPosition, defaultZoom, driverLocation, stops, routePoints, orderCoordinates }) => {
  const map = useMap(); 

  const handleRecenterClick = () => {
    let boundsToFit: L.LatLngBounds | null = null;
    if (routePoints && routePoints.length > 0) {
      boundsToFit = L.latLngBounds(routePoints);
    } else if (stops && stops.length > 0) {
      const stopCoords = stops.map(s => s.coordinates as LatLngExpression);
      if (driverLocation) boundsToFit = L.latLngBounds([driverLocation, ...stopCoords]);
      else boundsToFit = L.latLngBounds(stopCoords);
    } else if (orderCoordinates) {
      boundsToFit = L.latLngBounds([orderCoordinates.pickup, orderCoordinates.destination]);
    } else if (driverLocation) {
        map.setView(driverLocation, 15); // Zoom into driver location
        return;
    }


    if (boundsToFit && boundsToFit.isValid()) {
        map.fitBounds(boundsToFit, { padding: [50, 50] });
    } else {
        map.setView(defaultPosition, defaultZoom);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 right-4 z-[1000] bg-background shadow-md hover:bg-accent"
      onClick={handleRecenterClick}
      title="Recenter Map"
    >
      <LocateFixedIcon className="h-5 w-5" />
    </Button>
  );
};

const MapDisplay: React.FC<MapDisplayProps> = ({ orderCoordinates, driverLocation, stops, currentStopId }) => {
  const [isClient, setIsClient] = useState(false);
  const [routePoints, setRoutePoints] = useState<LatLngExpression[] | null>(null);
  
  const YOUR_ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pendingStops = useMemo(() => {
    if (!stops) return [];
    const currentIndex = stops.findIndex(s => s.id === currentStopId);
    if (currentStopId && currentIndex !== -1) {
        return stops.slice(currentIndex);
    }
    return stops;
  }, [stops, currentStopId]);


  useEffect(() => {
    if (!isClient || !YOUR_ORS_API_KEY || YOUR_ORS_API_KEY === 'YOUR_OPENROUTESERVICE_API_KEY_HERE') {
      if (YOUR_ORS_API_KEY === 'YOUR_OPENROUTESERVICE_API_KEY_HERE' || !YOUR_ORS_API_KEY) {
        console.warn('OpenRouteService API key is missing or is placeholder. Routing disabled.');
      }
      setRoutePoints(null);
      return;
    }

    const fetchMultiStopRoute = async () => {
      if (!driverLocation || !pendingStops || pendingStops.length === 0) {
        setRoutePoints(null);
        return;
      }

      const allWaypoints: LatLngExpression[] = [driverLocation, ...pendingStops.map(s => s.coordinates)];
      const coordinatesPayload = allWaypoints.map(coord => [ (coord as number[])[1], (coord as number[])[0] ]);

      const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;
      const body = {
        coordinates: coordinatesPayload,
        instructions: false,
        geometry_simplify: "false",
        preference: "fastest",
        units: "m",
      };

      try {
        const response = await axios.post(url, body, {
          headers: {
            'Authorization': YOUR_ORS_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10-second timeout
        });
        if (response.data && response.data.features && response.data.features.length > 0) {
          const routeCoords = response.data.features[0].geometry.coordinates;
          const leafletCoords: LatLngExpression[] = routeCoords.map((c: [number, number]) => [c[1], c[0]] as LatLngExpression);
          setRoutePoints(leafletCoords);
        } else {
          console.error('ORS Multi-Stop: No route found or unexpected response', response.data);
          setRoutePoints(null);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          console.error('Error fetching multi-stop route from ORS: The request timed out.');
        } else {
          console.error('Error fetching multi-stop route from ORS:', error);
        }
        setRoutePoints(null);
      }
    };
    
    const fetchSimpleRoute = async () => {
        if(!orderCoordinates) {
            setRoutePoints(null);
            return;
        }
        const { pickup, destination } = orderCoordinates;
        const pickupCoords = pickup as [number, number];
        const destCoords = destination as [number, number];
        const start = `${pickupCoords[1]},${pickupCoords[0]}`;
        const end = `${destCoords[1]},${destCoords[0]}`;
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${YOUR_ORS_API_KEY}&start=${start}&end=${end}`;
        try {
            const response = await axios.get(url, { timeout: 10000 }); // 10-second timeout
            if (response.data?.features?.[0]?.geometry?.coordinates) {
                const coordinates = response.data.features[0].geometry.coordinates;
                const leafletCoords: LatLngExpression[] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as LatLngExpression);
                setRoutePoints(leafletCoords);
            } else {
                setRoutePoints(null);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
              console.error('Error fetching simple route from ORS: The request timed out.');
            } else {
              console.error('Error fetching simple route from ORS:', error);
            }
            setRoutePoints(null);
        }
    };

    if (driverLocation && pendingStops && pendingStops.length > 0) {
      fetchMultiStopRoute();
    } else if (orderCoordinates) {
      fetchSimpleRoute();
    } else {
      setRoutePoints(null);
    }
  }, [driverLocation, pendingStops, orderCoordinates, isClient, YOUR_ORS_API_KEY]);

  if (!isClient) {
    return <div className="h-full w-full bg-muted flex items-center justify-center"><p>Initializing Map...</p></div>;
  }

  const defaultPosition: LatLngExpression = driverLocation || (stops && stops.length > 0 ? stops[0].coordinates : [-15.4167, 28.2833]); // Lusaka Center
  const defaultZoomLevel: number = 13;

  return (
    <MapContainer
      center={defaultPosition}
      zoom={defaultZoomLevel}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      attributionControl={false} 
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater 
        driverLocation={driverLocation} 
        stops={stops} 
        currentStopId={currentStopId} 
        routePoints={routePoints}
        orderCoordinates={orderCoordinates}
      />
      
      {driverLocation && (
        <CircleMarker center={driverLocation} radius={8} pathOptions={{ color: 'blue', fillColor: '#3B82F6', fillOpacity: 0.8, weight:2 }}>
             <Popup>Your current location</Popup>
        </CircleMarker>
      )}

      {stops && stops.map(stop => (
        <Marker 
          key={stop.id} 
          position={stop.coordinates} 
          icon={stop.type === 'pickup' ? pickupIcon(stop.id === currentStopId) : dropoffIcon(stop.id === currentStopId)}
        >
          <Popup>
            <strong>{stop.type === 'pickup' ? 'Pickup' : 'Dropoff'} #{stop.sequence}</strong><br/>
            {stop.shortAddress}<br/>
            Status: {stop.status.replace(/_/g, ' ')}
          </Popup>
        </Marker>
      ))}
      
      {!stops && orderCoordinates && (
        <>
          <Marker position={orderCoordinates.pickup} icon={pickupIcon(false)}>
            <Popup>Pickup Location</Popup>
          </Marker>
          <Marker position={orderCoordinates.destination} icon={dropoffIcon(false)}>
            <Popup>Destination Location</Popup>
          </Marker>
        </>
      )}

      {routePoints && routePoints.length > 0 ? (
        <Polyline positions={routePoints} color="#008080" weight={7} opacity={0.8} />
      ) : (
        !stops && orderCoordinates && <Polyline positions={[orderCoordinates.pickup, orderCoordinates.destination]} color="gray" dashArray="10, 5" />
      )}
      
      <RecenterButton 
        defaultPosition={defaultPosition} 
        defaultZoom={defaultZoomLevel}
        driverLocation={driverLocation}
        stops={stops}
        routePoints={routePoints}
        orderCoordinates={orderCoordinates}
      />
    </MapContainer>
  );
};

const MapDisplayWrapper: React.FC<MapDisplayProps> = (props) => {
  return <MapDisplay {...props} />;
};

export default MapDisplayWrapper;
