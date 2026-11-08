"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type RoomMapProps = {
  latitude: number;
  longitude: number;
  title: string;
};

const roomMarker = L.divIcon({
  className: "",
  html: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44" fill="none"><path d="M18 42s15-14.2 15-25A15 15 0 1 0 3 17c0 10.8 15 25 15 25Z" fill="#16835D" stroke="white" stroke-width="3"/><circle cx="18" cy="17" r="5" fill="white"/></svg>',
  iconSize: [36, 44],
  iconAnchor: [18, 42],
  popupAnchor: [0, -40],
});

export function RoomMap({ latitude, longitude, title }: RoomMapProps) {
  return (
    <div className="h-72 overflow-hidden rounded-xl border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={roomMarker}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
