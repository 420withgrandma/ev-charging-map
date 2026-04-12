export function filterStations(stations, filters) {
  return stations.filter((station) => {
    const matchesConnector =
      !filters.connector ||
      station.connectors.includes(filters.connector);

    const matchesOperator =
      !filters.operator ||
      station.operator === filters.operator;

    const matchesPower =
      !filters.minPower ||
      (station.maxPower !== null && station.maxPower >= Number(filters.minPower));

    const matchesSpeedCategory =
      !filters.speedCategory ||
      station.speedCategory === filters.speedCategory;

    return (
      matchesConnector &&
      matchesOperator &&
      matchesPower &&
      matchesSpeedCategory
    );
  });
}