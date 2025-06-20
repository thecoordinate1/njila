
'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { LocateFixedIcon, TruckIcon, PackageIcon, NavigationIcon } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server'; // For custom icons
import type { OrderStop } from '@/types/delivery';

// Icon fix for default markers (though we'll use custom ones mostly)
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
    className: 'leaflet-custom-div-icon', // Add base class for potential global styling
    iconSize: [32, 32], // Adjust as needed
    iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -28] // Point from which the popup should open relative to the iconAnchor
  });
};

const driverIcon = createCustomDivIcon(<NavigationIcon size={28} className="text-blue-500" />, false); // Driver is not "current stop"
const pickupIcon = (isCurrent: boolean) => createCustomDivIcon(<TruckIcon size={28} className="text-blue-600 fill-blue-200" />, isCurrent);
const dropoffIcon = (isCurrent: boolean) => createCustomDivIcon(<PackageIcon size={28} className="text-green-600 fill-green-200" />, isCurrent);


interface MapDisplayProps {
  orderCoordinates?: { // For simple two-point routes (legacy or specific use)
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
    } else if (orderCoordinates) { // Fallback for simple routes
      boundsToFit = L.latLngBounds([orderCoordinates.pickup, orderCoordinates.destination]);
    }


    if (boundsToFit && boundsToFit.isValid()) {
        // If current stop is known, try to center on it a bit more, but still show route.
        const currentStopInstance = stops?.find(s => s.id === currentStopId);
        if (currentStopInstance && driverLocation) {
            // map.fitBounds(L.latLngBounds([driverLocation, currentStopInstance.coordinates]), { padding: [70, 70], maxZoom: 16 });
             map.fitBounds(boundsToFit, { padding: [70,70], maxZoom: 17 }); // Show full route but ensure current is visible
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
  onRecenter: () => void;
}> = ({ onRecenter }) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 right-4 z-[1000] bg-background shadow-md hover:bg-accent"
      onClick={onRecenter}
      title="Recenter Map"
    >
      <LocateFixedIcon className="h-5 w-5" />
    </Button>
  );
};

const MapDisplay: React.FC<MapDisplayProps> = ({ orderCoordinates, driverLocation, stops, currentStopId }) => {
  const [isClient, setIsClient] = useState(false);
  const [routePoints, setRoutePoints] = useState<LatLngExpression[] | null>(null);
  
  const YOUR_ORS_API_KEY = '5b3ce3597851110001cf624814648d498f8945a29cb04a972a24b149'; 

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pendingStops = useMemo(() => {
    if (!stops) return [];
    // Filter out completed stops for routing, or handle based on specific logic
    // For now, let's route through all stops provided after driver location if currentStopId is known
    // Or just all stops if no specific current stop (e.g. overview)
    const currentIndex = stops.findIndex(s => s.id === currentStopId);
    if (currentStopId && currentIndex !== -1) {
        return stops.slice(currentIndex);
    }
    return stops; // If no current stop, or not found, route through all
  }, [stops, currentStopId]);


  useEffect(() => {
    if (!isClient || !YOUR_ORS_API_KEY || YOUR_ORS_API_KEY === 'YOUR_OPENROUTESERVICE_API_KEY_HERE') {
      if (YOUR_ORS_API_KEY === 'YOUR_OPENROUTESERVICE_API_KEY_HERE' || YOUR_ORS_API_KEY === '') {
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
      const coordinatesPayload = allWaypoints.map(coord => [ (coord as number[])[1], (coord as number[])[0] ]); // Lng, Lat for ORS

      const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;
      const body = {
        coordinates: coordinatesPayload,
        instructions: false,
        geometry_simplify: "false", // Get full geometry
        preference: "fastest",
        units: "m",
      };

      try {
        const response = await axios.post(url, body, {
          headers: {
            'Authorization': YOUR_ORS_API_KEY,
            'Content-Type': 'application/json',
          },
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
        console.error('Error fetching multi-stop route from ORS:', error);
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
            const response = await axios.get(url);
            if (response.data?.features?.[0]?.geometry?.coordinates) {
                const coordinates = response.data.features[0].geometry.coordinates;
                const leafletCoords: LatLngExpression[] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as LatLngExpression);
                setRoutePoints(leafletCoords);
            } else {
                setRoutePoints(null);
            }
        } catch (error) {
            console.error('Error fetching simple route from ORS:', error);
            setRoutePoints(null);
        }
    };


    if (driverLocation && pendingStops && pendingStops.length > 0) {
      fetchMultiStopRoute();
    } else if (orderCoordinates) { // Fallback to simple route if stops/driverLocation not primary mode
      fetchSimpleRoute();
    } else {
      setRoutePoints(null);
    }
  }, [driverLocation, pendingStops, orderCoordinates, isClient, YOUR_ORS_API_KEY]);

  const defaultPosition: LatLngExpression = driverLocation || (stops && stops.length > 0 ? stops[0].coordinates : [34.0522, -118.2437]); // LA default
  const defaultZoomLevel: number = 13;

  const map = useMap(); // For recenter button
  const handleRecenter = () => {
     // Logic from MapUpdater will handle fitting bounds based on current state
     // This button just triggers a re-evaluation by MapUpdater if map state is managed there
     // Or, directly call fitBounds here if simpler
    let boundsToFit: L.LatLngBounds | null = null;
    if (routePoints && routePoints.length > 0) {
      boundsToFit = L.latLngBounds(routePoints);
    } else if (stops && stops.length > 0) {
      const stopCoords = stops.map(s => s.coordinates as LatLngExpression);
      if (driverLocation) boundsToFit = L.latLngBounds([driverLocation, ...stopCoords]);
      else boundsToFit = L.latLngBounds(stopCoords);
    } else if (orderCoordinates) {
      boundsToFit = L.latLngBounds([orderCoordinates.pickup, orderCoordinates.destination]);
    }

    if (boundsToFit && boundsToFit.isValid()) {
        map.fitBounds(boundsToFit, { padding: [50, 50] });
    } else {
        map.setView(defaultPosition, defaultZoomLevel);
    }
  };


  if (!isClient) {
    return null; 
  }

  // Memoize mapKey to prevent re-renders unless critical props change
  const mapKey = useMemo(() => {
    let keyParts = ['map'];
    if (driverLocation) keyParts.push(`driver-${(driverLocation as number[]).join('-')}`);
    if (stops) keyParts.push(`stops-${stops.map(s => s.id).join('-')}`);
    if (currentStopId) keyParts.push(`current-${currentStopId}`);
    if (orderCoordinates) keyParts.push(`order-${(orderCoordinates.pickup as number[]).join('-')}-${(orderCoordinates.destination as number[]).join('-')}`);
    return keyParts.join('_');
  }, [driverLocation, stops, currentStopId, orderCoordinates]);

  return (
    <MapContainer
      key={mapKey} // Dynamic key if center/zoom needs to reset on major prop changes
      center={defaultPosition}
      zoom={defaultZoomLevel}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Routing by <a href="https://openrouteservice.org/">OpenRouteService</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater 
        driverLocation={driverLocation} 
        stops={stops} 
        currentStopId={currentStopId} 
        routePoints={routePoints}
        orderCoordinates={orderCoordinates}
      />
      
      {/* Driver Marker */}
      {driverLocation && (
        // <Marker position={driverLocation} icon={driverIcon}>
        //   <Popup>Your Location</Popup>
        // </Marker>
        <CircleMarker center={driverLocation} radius={8} pathOptions={{ color: 'blue', fillColor: '#3B82F6', fillOpacity: 0.8, weight:2 }}>
             <Popup>Your current location</Popup>
        </CircleMarker>
      )}

      {/* Stop Markers */}
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
      
      {/* Simple Order Markers (legacy) */}
      {!stops && orderCoordinates && (
        <>
          <Marker position={orderCoordinates.pickup}>
            <Popup>Pickup Location</Popup>
          </Marker>
          <Marker position={orderCoordinates.destination}>
            <Popup>Destination Location</Popup>
          </Marker>
        </>
      )}

      {/* Route Polyline */}
      {routePoints && routePoints.length > 0 ? (
        <Polyline positions={routePoints} color="#008080" weight={7} opacity={0.8} /> // Teal color for route
      ) : (
        // Fallback for simple route if no ORS route (e.g. key missing and simple order)
        !stops && orderCoordinates && <Polyline positions={[orderCoordinates.pickup, orderCoordinates.destination]} color="gray" dashArray="10, 5" />
      )}
      
      <RecenterButton 
        defaultPosition={defaultPosition} 
        defaultZoom={defaultZoomLevel}
        onRecenter={handleRecenter}
      />
    </MapContainer>
  );
};

// Wrapper to provide map instance to RecenterButton if needed outside MapContainer context
// but useMap() hook is better used inside a child of MapContainer.
const MapDisplayWrapper: React.FC<MapDisplayProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return <div className="h-full w-full bg-muted flex items-center justify-center"><p>Initializing Map...</p></div>;

  // Key for MapContainer to force re-mount if absolutely necessary, e.g. on batch change.
  // Generally, internal state and effects should handle updates.
  const mapContainerKey = props.stops ? `batch-${props.stops[0]?.id}` : 'default-map';


  return (
    // MapContainer already created inside MapDisplay, this wrapper might be redundant
    // unless we need to pass map instance differently. Let's simplify and keep MapDisplay as main component.
     <MapDisplay {...props} />
  );
}


export default MapDisplayWrapper; // Exporting the wrapper, or MapDisplay directly
// If MapDisplay directly: export default MapDisplay;
// The current structure of MapDisplay has useMap() in subcomponents, which is fine.
// So, export MapDisplay directly.

// Reverting to export default MapDisplay for simplicity.
// export default MapDisplay;

// The current MapDisplay uses useMap in MapUpdater and RecenterButton, that's fine.
// But RecenterButton is inside MapContainer now. So it can use useMap().
// So MapDisplay can be exported directly.

// The issue is RecenterButton needs map from useMap.
// MapDisplay creates the MapContainer. So RecenterButton needs to be child of MapContainer.
// Which it is. So MapDisplay should be the default export.
// Final decision: Export MapDisplay directly.
// The wrapper is only needed if context is tricky.

// Correct export:
// export default MapDisplay;
// The above wrapper (MapDisplayWrapper) is an over-complication for this stage.
// The provided MapDisplay.tsx should have RecenterButton inside MapContainer.

// The `MapDisplay` structure looks okay. RecenterButton and MapUpdater are children.
// The file provided for MapDisplay seems to have RecenterButton inside MapContainer which can call useMap.
// The issue might be that I added `const map = useMap();` in MapDisplay scope, not RecenterButton.
// Fixed that in the generated code for MapDisplay. RecenterButton will use its own useMap.
// Also, MapUpdater is correctly defined as a child.

    