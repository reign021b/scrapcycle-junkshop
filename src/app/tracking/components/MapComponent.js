import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = {
  width: "100%",
  height: "78.8vh",
  borderRadius: "12px",
};

const center = {
  lat: 7.446681,
  lng: 125.8093,
};

export default function MapComponent() {
  const [markerPosition, setMarkerPosition] = useState(center);

  const handleMapClick = (event) => {
    setMarkerPosition({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };

  const mapOptions = {
    fullscreenControl: false,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    disableDefaultUI: false,
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        options={mapOptions}
        onClick={handleMapClick}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </LoadScript>
  );
}
