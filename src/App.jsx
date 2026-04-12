import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup , ZoomControl, useMap  } from 'react-leaflet';
import { fetchChargeStations } from './services/openChargeMap';
import { filterStations } from './utils/filterStations';
import FilterPanel from './components/FilterPanel';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { geocodeLocation } from './services/geocoding';
import { calculateDistance } from './utils/distance';

function RecenterMap({ location }) {
  const map = useMap();

  if (location) {
    map.setView([location.latitude, location.longitude], 13);
  }

  return null;
}

function App() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    connector: '',
    operator: '',
    minPower: '',
    speedCategory: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [nearestStations, setNearestStations] = useState([]);

  const londonPosition = [51.5072, -0.1276];

  const speedCategoryOptions = ['Slow', 'Fast', 'Rapid', 'Ultra-rapid', 'Unknown'];

  useEffect(() => {
    async function loadStations() {
      try {
        const data = await fetchChargeStations();
        console.log(data[0]);
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

  const displayedStations = useMemo(() => {
  if (!searchedLocation) {
    return filteredStations;
  }

  return filteredStations.map((station) => ({
    ...station,
    distance: calculateDistance(
      searchedLocation.latitude,
      searchedLocation.longitude,
      station.latitude,
      station.longitude
    ),
  }));
}, [filteredStations, searchedLocation]);

  async function handleLocationSearch() {
    try {
      setSearchError('');

      const location = await geocodeLocation(searchQuery);
      setSearchedLocation(location);

      const stationsWithDistance = stations.map((station) => ({
        ...station,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          station.latitude,
          station.longitude
        ),
      }));

      const sortedStations = [...stationsWithDistance].sort(
        (a, b) => a.distance - b.distance
      );

      setNearestStations(sortedStations.slice(0, 5));
    } catch (error) {
      console.error(error);
      setSearchError(error.message);
      setSearchedLocation(null);
      setNearestStations([]);
    }
  }

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
        speedCategoryOptions={speedCategoryOptions}
      />

      <div
        style={{
          position: 'absolute',
          top: '320px',
          left: '10px',
          zIndex: 1000,
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          width: '260px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Find Nearest Charger</h3>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter postcode or area"
          style={{ width: '100%', marginBottom: '10px' }}
        />

        <button
          onClick={handleLocationSearch}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          Search
        </button>

        {searchError && (
          <p style={{ color: 'red', margin: '5px 0' }}>{searchError}</p>
        )}

        {searchedLocation && (
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Location:</strong> {searchedLocation.displayName}
          </p>
        )}

        {nearestStations.length > 0 && (
          <div>
            <h4 style={{ marginBottom: '8px' }}>Nearest Stations</h4>
            {nearestStations.map((station) => (
              <div key={station.id}>
                <strong>{station.title}</strong><br />
                <span style={{ fontSize: '14px' }}>
                  {station.distance.toFixed(2)} km away
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position='bottomright' />

        <RecenterMap location={searchedLocation} />

        {searchedLocation && (
          <Marker position={[searchedLocation.latitude, searchedLocation.longitude]}>
            <Popup>
              <strong>Searched Location</strong><br />
              {searchedLocation.displayName}
            </Popup>
          </Marker>
        )}

        <MarkerClusterGroup>
          {displayedStations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
            >
              <Popup>
                <strong>{station.title}</strong><br />
                {station.address}<br />
                Operator: {station.operator}<br />
                Max Power: {station.maxPower ? `${station.maxPower} kW` : 'Unknown'}<br />
                Speed: {station.speedCategory}<br />
                Connectors: {station.connectors.length > 0 ? station.connectors.join(', ') : 'Unknown'}<br />
                {station.distance !== undefined && (
                  <>
                    Distance: {station.distance.toFixed(2)} km<br />
                  </>
                )}<br /><br />

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  Get Directions
                </a>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default App;