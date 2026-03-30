export function normaliseStation(station) {
  const connections = station.Connections || [];

  const connectorTypes = connections
    .map(connection => connection.ConnectionType?.Title)
    .filter(Boolean);

  const powerValues = connections
    .map(connection => connection.PowerKW)
    .filter(power => typeof power === 'number');

  const maxPower =
    powerValues.length > 0 ? Math.max(...powerValues) : null;

  return {
    id: station.ID,
    title: station.AddressInfo?.Title || 'Unknown location',
    latitude: station.AddressInfo?.Latitude || null,
    longitude: station.AddressInfo?.Longitude || null,
    address: station.AddressInfo?.AddressLine1 || 'Address unavailable',
    town: station.AddressInfo?.Town || '',
    postcode: station.AddressInfo?.Postcode || '',
    operator: station.OperatorInfo?.Title || 'Unknown operator',
    connectors: connectorTypes,
    maxPower: maxPower,
    numberOfPoints: station.NumberOfPoints || null,
  };
}