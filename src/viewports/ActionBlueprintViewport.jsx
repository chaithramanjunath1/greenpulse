import { useLifestyle } from '../flux/LifestyleDispatcher.jsx';
import { ACTIONS } from '../flux/ActionCatalog.js';
import { generateActionPlan, projectSavings, prioritizeByLeverage } from '../algorithms/ReductionPath.js';
import { requestAdvice } from '../connectors/pulse-api.js';
import HabitNudgeWidget from '../widgets/HabitNudgeWidget.jsx';
import InsightPulseWidget from '../widgets/InsightPulseWidget.jsx';

/**
 * Reduction planning viewport — personalized action plans.
 */
const ActionBlueprintViewport = () => {
  const { emissions, completedActionIds, advice, isProcessing, dispatch } = useLifestyle();

  const rawPlan = generateActionPlan(emissions);
  const actionPlan = prioritizeByLeverage(rawPlan);

  const completedActions = actionPlan.filter((a) => completedActionIds.includes(a.id));
  const savings = projectSavings(emissions.totalKg, completedActions);

  const handleToggleAction = (actionId) => {
    if (completedActionIds.includes(actionId)) {
      dispatch({ type: ACTIONS.UNMARK_ACTION_DONE, payload: actionId });
    } else {
      dispatch({ type: ACTIONS.MARK_ACTION_DONE, payload: actionId });
    }
  };

  const handleRequestAdvice = async () => {
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

  return (
    <div>
      <section className="gp-animate-in" style={{ marginBottom: 'var(--gp-space-xl)' }}>
        <h2 className="gp-subheading">Action Blueprint</h2>
        <p className="gp-caption" style={{ marginTop: 'var(--gp-space-2xs)' }}>
          Personalized actions to reduce your carbon footprint through simple changes
        </p>
      </section>

      {/* ── Savings Summary ──────────────────────────────────── */}
      {emissions.totalKg > 0 && (
        <div className="gp-card gp-card--compact gp-animate-in gp-animate-in--delay-1" style={{ marginBottom: 'var(--gp-space-xl)' }}>
          <div className="gp-grid gp-grid--3col">
            <div className="gp-stat">
              <span className="gp-stat__value">{Math.round(emissions.totalKg)}</span>
              <span className="gp-stat__unit">Current kg CO₂</span>
            </div>
            <div className="gp-stat">
              <span className="gp-stat__value" style={{ color: 'var(--gp-emerald-bright)' }}>
                -{Math.round(savings.totalSaved)}
              </span>
              <span className="gp-stat__unit">Potential savings</span>
            </div>
            <div className="gp-stat">
              <span className="gp-stat__value" style={{ color: 'var(--gp-teal)' }}>
                {savings.reductionPercent}%
              </span>
              <span className="gp-stat__unit">Reduction</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Checklist ─────────────────────────────────── */}
      <HabitNudgeWidget
        actions={actionPlan}
        completedIds={completedActionIds}
        onToggle={handleToggleAction}
      />

      {/* ── AI Advice Section ────────────────────────────────── */}
      <div style={{ marginTop: 'var(--gp-space-xl)' }}>
        <button
          className="gp-btn gp-btn--primary"
          onClick={handleRequestAdvice}
          disabled={isProcessing || emissions.totalKg <= 0}
          aria-label="Request AI-powered reduction advice"
          id="btn-ai-advice"
          style={{ marginBottom: 'var(--gp-space-md)' }}
        >
          {isProcessing ? '⏳ Generating...' : '🤖 Get AI-Powered Advice'}
        </button>
        <InsightPulseWidget advice={advice} isProcessing={isProcessing} />
      </div>
    </div>
  );
};

export default ActionBlueprintViewport;
