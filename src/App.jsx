import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { fetchChargeStations } from './services/openChargeMap';
import { filterStations } from './utils/filterStations';
import FilterPanel from './components/FilterPanel';

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
      </MapContainer>
    </div>
  );
}

export default App;