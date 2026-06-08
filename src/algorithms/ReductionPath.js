/* ═══════════════════════════════════════════════════════════════
   ReductionPath — Personalized reduction strategy engine
   ═══════════════════════════════════════════════════════════════ */

const ACTION_LIBRARY = [
  { id: 'switch-transit', label: 'Use public transit instead of driving twice a week', potentialSaving: 340, effort: 'moderate', sector: 'commute' },
  { id: 'carpool-work', label: 'Carpool with a colleague for your daily commute', potentialSaving: 480, effort: 'moderate', sector: 'commute' },
  { id: 'bike-short', label: 'Cycle for trips under 5 km instead of driving', potentialSaving: 200, effort: 'minimal', sector: 'commute' },
  { id: 'remote-day', label: 'Work from home one extra day per week', potentialSaving: 260, effort: 'minimal', sector: 'commute' },
  { id: 'cut-red-meat', label: 'Replace red meat with poultry or plant-based twice a week', potentialSaving: 550, effort: 'moderate', sector: 'diet' },
  { id: 'local-produce', label: 'Buy seasonal and locally grown produce', potentialSaving: 130, effort: 'minimal', sector: 'diet' },
  { id: 'reduce-waste', label: 'Plan meals to reduce food waste by 30%', potentialSaving: 180, effort: 'moderate', sector: 'diet' },
  { id: 'meatless-day', label: 'Go fully plant-based one day per week', potentialSaving: 400, effort: 'minimal', sector: 'diet' },
  { id: 'led-switch', label: 'Replace all bulbs with LED alternatives', potentialSaving: 40, effort: 'minimal', sector: 'household' },
  { id: 'lower-heat', label: 'Reduce thermostat by 2°C during winter', potentialSaving: 300, effort: 'moderate', sector: 'household' },
  { id: 'unplug-standby', label: 'Unplug electronics when not in use', potentialSaving: 50, effort: 'minimal', sector: 'household' },
  { id: 'cold-laundry', label: 'Wash clothes in cold water', potentialSaving: 60, effort: 'minimal', sector: 'household' },
  { id: 'buy-less', label: 'Apply a 30-day rule before non-essential purchases', potentialSaving: 250, effort: 'moderate', sector: 'consumption' },
  { id: 'secondhand', label: 'Buy secondhand clothing and refurbished electronics', potentialSaving: 350, effort: 'significant', sector: 'consumption' },
  { id: 'repair-first', label: 'Repair devices instead of replacing them', potentialSaving: 150, effort: 'significant', sector: 'consumption' },
];

const EFFORT_SCORES = { minimal: 1, moderate: 2, significant: 3 };

/**
 * Generate personalized reduction actions based on the user's emission profile.
 * Prioritizes actions from the user's highest-emission sectors.
 * @param {{ totalKg: number, bySector: Object<string, number> }} profile
 * @returns {Array<{ id: string, label: string, potentialSaving: number, effort: string, sector: string }>}
 */
export const generateActionPlan = (profile) => {
  if (!profile || typeof profile.totalKg !== 'number') {
    return [];
  }

  const sectors = profile.bySector || {};
  const sectorEntries = Object.entries(sectors);
  sectorEntries.sort((a, b) => b[1] - a[1]);

  const rankedSectors = sectorEntries.map(([name]) => name);
  const selected = [];

  for (const sector of rankedSectors) {
    const sectorActions = ACTION_LIBRARY.filter((a) => a.sector === sector);
    for (const action of sectorActions) {
      if (selected.length >= 8) {
        break;
      }
      if (!selected.some((s) => s.id === action.id)) {
        selected.push({ ...action });
      }
    }
  }

  if (selected.length < 5) {
    for (const action of ACTION_LIBRARY) {
      if (selected.length >= 8) {
        break;
      }
      if (!selected.some((s) => s.id === action.id)) {
        selected.push({ ...action });
      }
    }
  }

  return selected;
};

/**
 * Calculate potential savings from adopting specific actions.
 * @param {number} currentTotal - Current emissions in kg
 * @param {Array<{ potentialSaving: number }>} adoptedActions
 * @returns {{ projectedTotal: number, totalSaved: number, reductionPercent: number }}
 */
export const projectSavings = (currentTotal, adoptedActions) => {
  if (typeof currentTotal !== 'number' || currentTotal <= 0) {
    return { projectedTotal: 0, totalSaved: 0, reductionPercent: 0 };
  }
  if (!Array.isArray(adoptedActions) || adoptedActions.length === 0) {
    return { projectedTotal: currentTotal, totalSaved: 0, reductionPercent: 0 };
  }

  let totalSaved = 0;
  for (const action of adoptedActions) {
    if (action && typeof action.potentialSaving === 'number') {
      totalSaved += action.potentialSaving;
    }
  }

  const projectedTotal = Math.max(0, currentTotal - totalSaved);
  const reductionPercent = Math.round((totalSaved / currentTotal) * 100);

  return {
    projectedTotal: Math.round(projectedTotal * 100) / 100,
    totalSaved: Math.round(totalSaved * 100) / 100,
    reductionPercent: Math.min(reductionPercent, 100),
  };
};

/**
 * Sort actions by impact-to-effort ratio (best bang for buck first).
 * @param {Array<{ potentialSaving: number, effort: string }>} actions
 * @returns {Array} sorted actions (highest leverage first)
 */
export const prioritizeByLeverage = (actions) => {
  if (!Array.isArray(actions)) {
    return [];
  }

  const withLeverage = actions.map((action) => {
    const effortScore = EFFORT_SCORES[action.effort] || 2;
    const leverage = action.potentialSaving / effortScore;
    return { ...action, leverage };
  });

  withLeverage.sort((a, b) => b.leverage - a.leverage);

  return withLeverage.map(({ leverage: _l, ...rest }) => rest);
};
