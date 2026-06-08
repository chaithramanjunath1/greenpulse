import PropTypes from 'prop-types';

/**
 * Displays the user's total emissions compared to national and global averages.
 * Helps individuals understand where they stand relative to benchmarks.
 * Uses horizontal bar comparison for intuitive visual understanding.
 * @param {{ currentKg: number }} props
 */
const BenchmarkWidget = ({ currentKg }) => {
  const GLOBAL_AVG = 4700;
  const NATIONAL_AVG = 4000;
  const TARGET = 2500;
  const maxVal = Math.max(GLOBAL_AVG, currentKg, 1);

  const bars = [
    { label: 'Your Footprint', value: currentKg, color: 'var(--gp-emerald-bright)' },
    { label: 'National Avg', value: NATIONAL_AVG, color: 'var(--gp-amber)' },
    { label: 'Global Avg', value: GLOBAL_AVG, color: 'var(--gp-rose)' },
    { label: '2030 Target', value: TARGET, color: 'var(--gp-teal)' },
  ];

  let verdict = 'Start logging activities to see how you compare!';
  if (currentKg > 0 && currentKg < TARGET) {
    verdict = '🌟 Outstanding! You are well below the 2030 climate target.';
  } else if (currentKg > 0 && currentKg < NATIONAL_AVG) {
    verdict = '👍 Great — you are below the national average. Keep reducing!';
  } else if (currentKg > 0) {
    verdict = '⚠️ Your footprint is above the national average. Let\'s work on reducing it!';
  }

  return (
    <div className="gp-card gp-animate-in gp-animate-in--delay-3">
      <p className="gp-label" style={{ marginBottom: 'var(--gp-space-sm)' }}>
        How You Compare
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gp-space-sm)' }}>
        {bars.map((bar) => {
          const widthPct = maxVal > 0 ? Math.min((bar.value / maxVal) * 100, 100) : 0;
          return (
            <div key={bar.label}>
              <div className="gp-flex gp-flex--between" style={{ marginBottom: '0.2rem' }}>
                <span className="gp-caption">{bar.label}</span>
                <span className="gp-caption" style={{ fontWeight: 600 }}>
                  {bar.value > 0 ? `${Math.round(bar.value).toLocaleString()} kg` : '—'}
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  borderRadius: 'var(--gp-radius-pill)',
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${widthPct}%`,
                    borderRadius: 'var(--gp-radius-pill)',
                    background: bar.color,
                    transition: 'width 0.8s var(--gp-ease)',
                  }}
                  role="progressbar"
                  aria-valuenow={Math.round(bar.value)}
                  aria-valuemin={0}
                  aria-valuemax={maxVal}
                  aria-label={`${bar.label}: ${Math.round(bar.value)} kg CO2`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="gp-caption" style={{ marginTop: 'var(--gp-space-md)', fontStyle: 'italic' }}>
        {verdict}
      </p>
    </div>
  );
};

BenchmarkWidget.propTypes = {
  currentKg: PropTypes.number.isRequired,
};

export default BenchmarkWidget;
