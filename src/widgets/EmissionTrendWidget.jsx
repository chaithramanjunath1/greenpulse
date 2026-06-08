import PropTypes from 'prop-types';

/**
 * Sparkline SVG chart showing recent emission trends.
 */
const EmissionTrendWidget = ({ activities }) => {
  if (!activities || activities.length < 2) {
    return null; // Need at least 2 points for a line
  }

  // Take the last 7 activities and reverse them so oldest is on the left
  const recent = [...activities].slice(0, 7).reverse();
  const dataPoints = recent.map(a => a.kg || 0);

  const maxVal = Math.max(...dataPoints, 1);
  
  // SVG dimensions
  const width = 300;
  const height = 60;
  const paddingY = 10;
  const paddingX = 10;

  const dx = (width - paddingX * 2) / (dataPoints.length - 1);
  
  // Calculate coordinates
  const points = dataPoints.map((val, i) => {
    const x = paddingX + i * dx;
    const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  
  // Area path for the gradient fill
  const areaD = `${pathD} L ${points[points.length-1].split(',')[0]},${height} L ${paddingX},${height} Z`;

  return (
    <div className="gp-card gp-card--compact gp-animate-in gp-animate-in--delay-2" style={{ marginTop: 'var(--gp-space-md)' }}>
      <div className="gp-flex gp-flex--between" style={{ marginBottom: 'var(--gp-space-sm)' }}>
        <p className="gp-label">Recent Trend</p>
        <span className="gp-caption">Last {dataPoints.length} entries</span>
      </div>
      
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gp-emerald)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--gp-emerald)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <path d={areaD} fill="url(#trend-grad)" />
        
        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--gp-emerald-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data points */}
        {points.map((pt, i) => {
          const [x, y] = pt.split(',');
          return (
            <circle key={i} cx={x} cy={y} r="3" fill="var(--gp-void)" stroke="var(--gp-emerald-bright)" strokeWidth="1.5" />
          );
        })}
      </svg>
    </div>
  );
};

EmissionTrendWidget.propTypes = {
  activities: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default EmissionTrendWidget;
