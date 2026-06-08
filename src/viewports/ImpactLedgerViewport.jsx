import { useLifestyle } from '../flux/LifestyleDispatcher.jsx';
import { ACTIONS } from '../flux/ActionCatalog.js';
import { computeSingleEntry, resolveSector } from '../algorithms/CarbonMath.js';
import LifestyleInputWidget from '../widgets/LifestyleInputWidget.jsx';
import EmissionTrendWidget from '../widgets/EmissionTrendWidget.jsx';

const SECTOR_ICONS = {
  commute: '🚗',
  diet: '🍽️',
  household: '⚡',
  consumption: '🛍️',
};

/**
 * Activity logging viewport — log new entries and view history.
 */
const ImpactLedgerViewport = () => {
  const { activities, isProcessing, dispatch } = useLifestyle();

  const handleSubmitEntry = (entry) => {
    const kg = computeSingleEntry(entry.kind, entry.amount);
    const sector = resolveSector(entry.kind);
    const enrichedEntry = {
      ...entry,
      kg,
      sector,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: ACTIONS.APPEND_ACTIVITY, payload: enrichedEntry });
    dispatch({ 
      type: ACTIONS.SHOW_TOAST, 
      payload: { type: 'success', title: 'Activity Logged', message: `Added ${kg} kg CO₂ to your ledger.` } 
    });
  };

  const handleDiscard = (index) => {
    dispatch({ type: ACTIONS.DISCARD_ACTIVITY, payload: index });
    dispatch({ 
      type: ACTIONS.SHOW_TOAST, 
      payload: { type: 'info', title: 'Activity Removed', message: 'Your footprint has been updated.' } 
    });
  };

  return (
    <div>
      <section className="gp-animate-in" style={{ marginBottom: 'var(--gp-space-xl)' }}>
        <h2 className="gp-subheading">Impact Ledger</h2>
        <p className="gp-caption" style={{ marginTop: 'var(--gp-space-2xs)' }}>
          Log your daily activities to track your carbon footprint over time
        </p>
      </section>

      <LifestyleInputWidget
        onSubmitEntry={handleSubmitEntry}
        isProcessing={isProcessing}
      />

      {activities.length >= 2 && <EmissionTrendWidget activities={activities} />}

      {/* ── Activity History ────────────────────────────────── */}
      <div className="gp-card gp-animate-in gp-animate-in--delay-1" style={{ marginTop: 'var(--gp-space-xl)' }}>
        <div className="gp-flex gp-flex--between" style={{ marginBottom: 'var(--gp-space-md)' }}>
          <p className="gp-label">Activity History ({activities.length} entries)</p>
        </div>

        {activities.length === 0 ? (
          <div className="gp-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gp-text-muted)', marginBottom: 'var(--gp-space-md)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p className="gp-empty__message">
              No activities logged yet. Start by adding your first entry above.
            </p>
          </div>
        ) : (
          <div className="gp-feed">
            {activities.map((activity, idx) => (
              <div key={idx} className="gp-feed__item">
                <div className="gp-feed__icon">
                  {SECTOR_ICONS[activity.sector] || '📌'}
                </div>
                <div className="gp-feed__details">
                  <p className="gp-feed__title">
                    {activity.kind.replace(/_/g, ' ')}
                  </p>
                  <p className="gp-feed__meta">
                    {activity.amount} {activity.sector === 'commute' ? 'km' : 'units'}
                    {activity.timestamp ? ` · ${new Date(activity.timestamp).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="gp-feed__emission">
                  +{activity.kg ? activity.kg.toFixed(1) : '0'} kg
                </div>
                <button
                  className="gp-btn gp-btn--danger"
                  onClick={() => handleDiscard(idx)}
                  aria-label={`Remove ${activity.kind.replace(/_/g, ' ')} entry`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpactLedgerViewport;
