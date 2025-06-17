
'use client';

import type React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not showing up correctly with bundlers like Webpack.
// This ensures that the paths to the icon images are correctly resolved.
// It's important that Leaflet's CSS is imported before this fix.
// We are using CDN links for the images to avoid issues with local asset bundling.
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const MapDisplay: React.FC = () => {
  const position: LatLngExpression = [51.505, -0.09]; // Default position (London)
  const zoomLevel: number = 13;

  return (
    <MapContainer
      key="leaflet-map-container" // Added a static key
      center={position}
      zoom={zoomLevel}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapDisplay;
