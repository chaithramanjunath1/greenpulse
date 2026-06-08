import PropTypes from 'prop-types';

const EFFORT_LABELS = {
  minimal: 'Easy',
  moderate: 'Medium',
  significant: 'Hard',
};

/**
 * Action checklist item with toggle.
 * Action checklist item with toggle and effort badges.
 */
const HabitNudgeWidget = ({ actions, completedIds, onToggle }) => {
  if (!actions || actions.length === 0) {
    return (
      <div className="gp-card gp-animate-in">
        <p className="gp-label">Reduction Actions</p>
        <div className="gp-empty" style={{ padding: 'var(--gp-space-md) 0' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gp-text-muted)', marginBottom: 'var(--gp-space-sm)' }}>
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <p className="gp-caption">Log activities to see personalized reduction actions</p>
        </div>
      </div>
    );
  }

  const doneCount = actions.filter((a) => completedIds.includes(a.id)).length;

  return (
    <div className="gp-card gp-animate-in">
      <div className="gp-flex gp-flex--between" style={{ marginBottom: 'var(--gp-space-md)' }}>
        <p className="gp-label">Reduction Actions</p>
        <span className="gp-caption">{doneCount} / {actions.length} completed</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gp-space-xs)' }}>
        {actions.map((action) => {
          const isDone = completedIds.includes(action.id);
          const effortClass = `gp-badge gp-badge--${action.effort}`;

          return (
            <div 
              key={action.id} 
              className={`gp-nudge${isDone ? ' gp-nudge--done' : ''}`}
              onClick={() => onToggle(action.id)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onToggle(action.id); } }}
            >
              <div
                className={`gp-nudge__check${isDone ? ' gp-nudge__check--done' : ''}`}
                aria-label={`${isDone ? 'Unmark' : 'Mark'} "${action.label}" as done`}
                id={`nudge-${action.id}`}
              >
                {isDone ? '✓' : ''}
              </div>
              <div className="gp-nudge__body">
                <p className="gp-nudge__label">{action.label}</p>
                <div className="gp-flex" style={{ marginTop: '0.25rem' }}>
                  <span className="gp-nudge__saving">
                    Save ~{action.potentialSaving} kg/yr
                  </span>
                  <span className={effortClass}>
                    {EFFORT_LABELS[action.effort] || action.effort}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

HabitNudgeWidget.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      potentialSaving: PropTypes.number.isRequired,
      effort: PropTypes.string.isRequired,
    })
  ),
  completedIds: PropTypes.arrayOf(PropTypes.string),
  onToggle: PropTypes.func.isRequired,
};

HabitNudgeWidget.defaultProps = {
  actions: [],
  completedIds: [],
};

export default HabitNudgeWidget;
