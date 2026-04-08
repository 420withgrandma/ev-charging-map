import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { fetchChargeStations } from './services/openChargeMap';
import { filterStations } from './utils/filterStations';
import FilterPanel from './components/FilterPanel';
import MarkerClusterGroup from 'react-leaflet-cluster';

function App() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    connector: '',
    operator: '',
    minPower: '',
  });

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

  const connectorOptions = useMemo(() => {
    const allConnectors = stations.flatMap((station) => station.connectors);
    return [...new Set(allConnectors)].sort();
  }, [stations]);

  const operatorOptions = useMemo(() => {
    const allOperators = stations.map((station) => station.operator);
    return [...new Set(allOperators)].sort();
  }, [stations]);

  const filteredStations = useMemo(() => {
    return filterStations(stations, filters);
  }, [stations, filters]);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffdddd' }}>
          Error: {error}
        </div>
      )}

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        connectorOptions={connectorOptions}
        operatorOptions={operatorOptions}
      />

      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          width: '200px',
        }}
      >
        <h4 style={{ margin: 0 }}>Stats</h4>
        <p>Total: {stations.length}</p>
        <p>Showing: {filteredStations.length}</p>
        <p>
          Avg Power: {
            filteredStations.length > 0
              ? (
                  filteredStations.reduce((sum, s) => sum + (s.maxPower || 0), 0) /
                  filteredStations.length
                ).toFixed(1)
              : 0
          } kW
        </p>
      </div>

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

        <MarkerClusterGroup>
          {filteredStations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
            >
              <Popup>
                <strong>{station.title}</strong><br />
                {station.address}<br />
                Operator: {station.operator}<br />
                Max Power: {station.maxPower ? `${station.maxPower} kW` : 'Unknown'}<br />
                Connectors: {station.connectors.length > 0 ? station.connectors.join(', ') : 'Unknown'}
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default App;