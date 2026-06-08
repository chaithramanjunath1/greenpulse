import PropTypes from 'prop-types';

/**
 * Display list of AI-generated eco insights with shimmer loading state.
 */
const InsightPulseWidget = ({ advice, isProcessing }) => {
  if (isProcessing) {
    return (
      <div className="gp-card gp-animate-in gp-animate-in--delay-3">
        <p className="gp-label" style={{ marginBottom: 'var(--gp-space-sm)' }}>AI Insights</p>
        <div className="gp-insight-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="gp-shimmer gp-shimmer--line" style={{ width: `${85 - n * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!advice || advice.length === 0) {
    return (
      <div className="gp-card gp-card--compact gp-animate-in gp-animate-in--delay-3">
        <p className="gp-label" style={{ marginBottom: 'var(--gp-space-xs)' }}>AI Insights</p>
        <p className="gp-caption">Log some activities to receive personalized tips</p>
      </div>
    );
  }

  return (
    <div className="gp-card gp-animate-in gp-animate-in--delay-3">
      <p className="gp-label" style={{ marginBottom: 'var(--gp-space-sm)' }}>Personalized Insights</p>
      <div className="gp-insight-list">
        {advice.map((tip, idx) => (
          <div key={idx} className="gp-insight-item">
            <span className="gp-insight-item__icon" aria-hidden="true">💡</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

InsightPulseWidget.propTypes = {
  advice: PropTypes.arrayOf(PropTypes.string),
  isProcessing: PropTypes.bool,
};

InsightPulseWidget.defaultProps = {
  advice: [],
  isProcessing: false,
};

export default InsightPulseWidget;
