import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Animated SVG circular progress ring.
 * Shows emission progress toward a target with glow effect.
 */
const ProgressRingWidget = ({ currentKg, targetKg, label }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeTarget = targetKg > 0 ? targetKg : 4000;
  const rawPercent = safeTarget > 0 ? (currentKg / safeTarget) * 100 : 0;
  const percent = Math.min(rawPercent, 100);
  const offset = circumference - (percent / 100) * circumference;

  let strokeColor = '#10b981';
  let isGreat = false;
  
  if (percent > 80) {
    strokeColor = '#f87171';
  } else if (percent > 50) {
    strokeColor = '#fbbf24';
  } else if (percent > 0) {
    isGreat = true;
  }

  return (
    <div className="gp-card gp-card--compact gp-animate-in gp-animate-in--delay-1" style={{ textAlign: 'center' }}>
      <p className="gp-label" style={{ marginBottom: 'var(--gp-space-sm)' }}>{label}</p>

      <svg
        className={isGreat ? 'gp-animate-pulse' : ''}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Carbon emissions progress: ${Math.round(percent)}% of target`}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
            filter: `drop-shadow(0 0 6px ${strokeColor}40)`,
          }}
        />
        {/* Center text */}
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#f1f5f9"
          fontSize="28"
          fontWeight="700"
          fontFamily="Outfit, sans-serif"
        >
          {Math.round(percent)}%
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#64748b"
          fontSize="11"
          fontFamily="Outfit, sans-serif"
        >
          of {safeTarget} kg target
        </text>
      </svg>

      <div className="gp-stat" style={{ marginTop: 'var(--gp-space-sm)', alignItems: 'center' }}>
        <span className="gp-stat__value" style={{ color: strokeColor }}>
          {currentKg >= 1000 ? `${(currentKg / 1000).toFixed(1)}t` : `${Math.round(currentKg)} kg`}
        </span>
        <span className="gp-stat__unit">CO₂ emitted</span>
      </div>
    </div>
  );
};

ProgressRingWidget.propTypes = {
  currentKg: PropTypes.number.isRequired,
  targetKg: PropTypes.number,
  label: PropTypes.string,
};

ProgressRingWidget.defaultProps = {
  targetKg: 4000,
  label: 'Annual Target',
};

export default ProgressRingWidget;
