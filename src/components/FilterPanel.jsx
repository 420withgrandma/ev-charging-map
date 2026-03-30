function FilterPanel({
  filters,
  setFilters,
  connectorOptions,
  operatorOptions,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        width: '260px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Filters</h3>

      <div style={{ marginBottom: '10px' }}>
        <label>Connector Type</label>
        <select
          value={filters.connector}
          onChange={(e) =>
            setFilters({ ...filters, connector: e.target.value })
          }
          style={{ width: '100%', marginTop: '5px' }}
        >
          <option value="">All</option>
          {connectorOptions.map((connector) => (
            <option key={connector} value={connector}>
              {connector}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Operator</label>
        <select
          value={filters.operator}
          onChange={(e) =>
            setFilters({ ...filters, operator: e.target.value })
          }
          style={{ width: '100%', marginTop: '5px' }}
        >
          <option value="">All</option>
          {operatorOptions.map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Minimum Power (kW)</label>
        <input
          type="number"
          value={filters.minPower}
          onChange={(e) =>
            setFilters({ ...filters, minPower: e.target.value })
          }
          placeholder="e.g. 50"
          style={{ width: '100%', marginTop: '5px' }}
        />
      </div>

      <button
        onClick={() =>
          setFilters({
            connector: '',
            operator: '',
            minPower: '',
          })
        }
        style={{ width: '100%' }}
      >
        Clear Filters
      </button>
    </div>
  );
}

export default FilterPanel;