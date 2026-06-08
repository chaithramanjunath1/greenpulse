import PropTypes from 'prop-types';

const SECTOR_COLORS = {
  commute: '#38bdf8',
  diet: '#fbbf24',
  household: '#f87171',
  consumption: '#a78bfa',
};

const SECTOR_LABELS = {
  commute: 'Transport',
  diet: 'Diet',
  household: 'Energy',
  consumption: 'Shopping',
};

/**
 * Horizontal stacked bar chart showing emission breakdown by sector.
 * Pure CSS implementation — no chart library.
 */
const CarbonSplitWidget = ({ bySector }) => {
  const entries = Object.entries(bySector || {}).filter(([, val]) => val > 0);
  const total = entries.reduce((sum, [, val]) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="gp-card gp-card--compact gp-animate-in gp-animate-in--delay-2">
        <p className="gp-label" style={{ marginBottom: 'var(--gp-space-xs)' }}>Emission Breakdown</p>
        <div className="gp-empty" style={{ padding: 'var(--gp-space-lg) 0' }}>
          <p className="gp-caption">No emissions logged yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-card gp-card--compact gp-animate-in gp-animate-in--delay-2">
      <p className="gp-label" style={{ marginBottom: 'var(--gp-space-sm)' }}>Emission Breakdown</p>

      <div className="gp-split-bar">
        {entries.map(([sector, kg]) => {
          const pct = (kg / total) * 100;
          return (
            <div
              key={sector}
              className="gp-split-bar__segment"
              style={{
                width: `${pct}%`,
                backgroundColor: SECTOR_COLORS[sector] || '#64748b',
              }}
              title={`${SECTOR_LABELS[sector] || sector}: ${kg.toFixed(1)} kg (${Math.round(pct)}%)`}
            />
          );
        })}
      </div>

      <div className="gp-split-legend">
        {entries.map(([sector, kg]) => {
          const pct = Math.round((kg / total) * 100);
          return (
            <div key={sector} className="gp-split-legend__item">
              <span
                className="gp-split-legend__dot"
                style={{ backgroundColor: SECTOR_COLORS[sector] || '#64748b' }}
              />
              <span>{SECTOR_LABELS[sector] || sector}</span>
              <span className="gp-caption">{Math.round(kg)} kg ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

CarbonSplitWidget.propTypes = {
  bySector: PropTypes.objectOf(PropTypes.number),
};

CarbonSplitWidget.defaultProps = {
  bySector: {},
};

export default CarbonSplitWidget;
