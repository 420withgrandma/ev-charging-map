import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function App() {
  const [stations, setStations] = useState([]);

  const londonPosition = [51.5072, -0.1276];

  useEffect(() => {
    fetch("https://api.openchargemap.io/v3/poi/?output=json&countrycode=GB&maxresults=50&key=405819b5-00f9-4be7-8859-aca6826db1fb")
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setStations(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={londonPosition}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => {
          const lat = station.AddressInfo?.Latitude;
          const lng = station.AddressInfo?.Longitude;

          if (!lat || !lng) return null;

          return (
            <Marker key={station.ID} position={[lat, lng]}>
              <Popup>
                <strong>{station.AddressInfo?.Title}</strong><br />
                {station.AddressInfo?.AddressLine1}<br />
                Operator: {station.OperatorInfo?.Title || "Unknown"}
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
}

export default App;