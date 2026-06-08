import PropTypes from 'prop-types';
import { useLifestyle } from '../flux/LifestyleDispatcher.jsx';
import { ACTIONS } from '../flux/ActionCatalog.js';
import { requestAdvice } from '../connectors/pulse-api.js';
import ProgressRingWidget from '../widgets/ProgressRingWidget.jsx';
import CarbonSplitWidget from '../widgets/CarbonSplitWidget.jsx';
import InsightPulseWidget from '../widgets/InsightPulseWidget.jsx';
import BenchmarkWidget from '../widgets/BenchmarkWidget.jsx';

const SECTOR_ICONS = {
  commute: '🚗',
  diet: '🍽️',
  household: '⚡',
  consumption: '🛍️',
};

/**
 * Main overview viewport — the primary landing view.
 * Contains the single <h1> for the entire application.
 */
const CommandCenterViewport = ({ onNavigate }) => {
  const { emissions, activities, advice, isProcessing, completedActionIds, dispatch } = useLifestyle();

  const handleFetchAdvice = async () => {
    if (emissions.totalKg <= 0) {
      return;
    }
    dispatch({ type: ACTIONS.SIGNAL_LOADING });
    const result = await requestAdvice(emissions);
    if (result.ok) {
      dispatch({ type: ACTIONS.STORE_ADVICE, payload: result.data });
    }
    dispatch({ type: ACTIONS.SIGNAL_READY });
  };

  const recentActivities = activities.slice(0, 5);

  const doneCount = completedActionIds ? completedActionIds.length : 0;
  let rankInfo = { level: 'Eco-Novice', color: 'var(--gp-text-muted)' };
  if (doneCount >= 4) {
    rankInfo = { level: 'Eco-Champion', color: 'var(--gp-amber)' };
  } else if (doneCount >= 1) {
    rankInfo = { level: 'Eco-Guardian', color: 'var(--gp-emerald-bright)' };
  }

  return (
    <div>
      {/* ── Hero Section with the sole H1 ────────────────────── */}
      <section className="gp-animate-in" style={{ marginBottom: 'var(--gp-space-2xl)' }}>
        <div className="gp-flex" style={{ marginBottom: 'var(--gp-space-sm)' }}>
          <span className="gp-badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: rankInfo.color, border: `1px solid ${rankInfo.color}` }}>
            {rankInfo.level} ({doneCount} actions)
          </span>
        </div>
        <h1 className="gp-headline">
          <span>Understand, Track, and Reduce</span>{' '}
          Your Carbon Footprint
        </h1>
        <p className="gp-body" style={{ marginTop: 'var(--gp-space-sm)', maxWidth: '600px' }}>
          GreenPulse empowers you with personalized insights and simple daily actions
          to lower your environmental impact.
        </p>
      </section>

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div className="gp-grid gp-grid--auto" style={{ marginBottom: 'var(--gp-space-xl)' }}>
        <ProgressRingWidget
          currentKg={emissions.totalKg}
          targetKg={4000}
          label="Annual Target"
        />
        <CarbonSplitWidget bySector={emissions.bySector} />
      </div>

      {/* ── Benchmark Comparison ──────────────────────────────── */}
      <BenchmarkWidget currentKg={emissions.totalKg} />

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="gp-flex" style={{ gap: 'var(--gp-space-md)', marginBottom: 'var(--gp-space-xl)' }}>
        <button
          className="gp-btn gp-btn--primary"
          onClick={() => onNavigate('impact-ledger')}
          aria-label="Navigate to activity logging"
          id="btn-go-log"
        >
          📊 Log Activity
        </button>
        <button
          className="gp-btn gp-btn--ghost"
          onClick={handleFetchAdvice}
          disabled={isProcessing || emissions.totalKg <= 0}
          aria-label="Get personalized AI reduction advice"
          id="btn-get-advice"
        >
          {isProcessing ? '⏳ Loading...' : '✨ Get AI Tips'}
        </button>
      </div>

      {/* ── AI Insights ──────────────────────────────────────── */}
      <InsightPulseWidget advice={advice} isProcessing={isProcessing} />

      {/* ── Recent Activity ──────────────────────────────────── */}
      {recentActivities.length > 0 && (
        <div className="gp-card gp-animate-in gp-animate-in--delay-4" style={{ marginTop: 'var(--gp-space-xl)' }}>
          <div className="gp-flex gp-flex--between" style={{ marginBottom: 'var(--gp-space-md)' }}>
            <p className="gp-label">Recent Activity</p>
            <button
              className="gp-btn gp-btn--ghost"
              onClick={() => onNavigate('impact-ledger')}
              aria-label="View all logged activities"
              id="btn-view-all"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
            >
              View All →
            </button>
          </div>

          <div className="gp-feed">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="gp-feed__item">
                <div className="gp-feed__icon">
                  {SECTOR_ICONS[activity.sector] || '📌'}
                </div>
                <div className="gp-feed__details">
                  <p className="gp-feed__title">{activity.kind.replace(/_/g, ' ')}</p>
                  <p className="gp-feed__meta">{activity.amount} units</p>
                </div>
                <div className="gp-feed__emission">
                  +{activity.kg ? activity.kg.toFixed(1) : '0'} kg
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Understanding Section — educational content ──────── */}
      <section className="gp-card gp-animate-in gp-animate-in--delay-4" style={{ marginTop: 'var(--gp-space-xl)' }} aria-labelledby="understand-heading">
        <h2 className="gp-subheading" id="understand-heading" style={{ marginBottom: 'var(--gp-space-sm)' }}>
          Understanding Your Carbon Footprint
        </h2>
        <p className="gp-body" style={{ marginBottom: 'var(--gp-space-md)' }}>
          A carbon footprint measures the total greenhouse gas emissions caused by your daily activities, 
          expressed in kilograms of CO₂ equivalent (kg CO₂e). The four major sectors are:
        </p>
        <div className="gp-grid gp-grid--auto" style={{ gap: 'var(--gp-space-sm)' }}>
          <div className="gp-info-card">
            <span aria-hidden="true">🚗</span>
            <strong>Transportation</strong>
            <span className="gp-caption">Driving, flying, and commuting — often the largest source.</span>
          </div>
          <div className="gp-info-card">
            <span aria-hidden="true">🍽️</span>
            <strong>Food &amp; Diet</strong>
            <span className="gp-caption">Red meat and dairy have the highest per-serving emissions.</span>
          </div>
          <div className="gp-info-card">
            <span aria-hidden="true">⚡</span>
            <strong>Home Energy</strong>
            <span className="gp-caption">Electricity and heating — switch to renewables to save big.</span>
          </div>
          <div className="gp-info-card">
            <span aria-hidden="true">🛍️</span>
            <strong>Shopping</strong>
            <span className="gp-caption">Electronics and fast fashion carry hidden carbon costs.</span>
          </div>
        </div>
        <p className="gp-caption" style={{ marginTop: 'var(--gp-space-md)', fontStyle: 'italic' }}>
          The average person emits ~4,700 kg CO₂e per year. The 2030 Paris Agreement target is 2,500 kg. 
          Track your activities above to see where you stand!
        </p>
      </section>
    </div>
  );
};

CommandCenterViewport.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

export default CommandCenterViewport;
