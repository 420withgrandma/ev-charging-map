import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { fetchChargeStations } from './services/openChargeMap';

function App() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);

  const londonPosition = [51.5072, -0.1276];

  useEffect(() => {
    async function loadStations() {
      try {
        const data = await fetchChargeStations();
        setStations(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }

    loadStations();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffdddd' }}>
          Error: {error}
        </div>
      )}

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