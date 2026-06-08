const API_BASE = '/api/v1';

/**
 * Evaluate carbon emissions from activity entries.
 * @param {Array<{kind: string, amount: number}>} entries
 * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
 */
export const evaluateCarbon = async (entries) => {
  try {
    const res = await fetch(`${API_BASE}/carbon/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    const body = await res.json();
    if (!res.ok) {
      return { ok: false, error: body.error || 'Evaluation failed' };
    }
    return { ok: true, data: body };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

/**
 * Fetch emission benchmarks for comparison.
 * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
 */
export const fetchBenchmarks = async () => {
  try {
    const res = await fetch(`${API_BASE}/carbon/benchmarks`);
    const body = await res.json();
    if (!res.ok) {
      return { ok: false, error: body.error || 'Failed to load benchmarks' };
    }
    return { ok: true, data: body };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

/**
 * Request AI-powered reduction advice.
 * @param {{ totalKg: number, bySector: Object<string, number> }} profile
 * @returns {Promise<{ok: boolean, data?: string[], error?: string}>}
 */
export const requestAdvice = async (profile) => {
  try {
    const res = await fetch(`${API_BASE}/advisor/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const body = await res.json();
    if (!res.ok) {
      return { ok: false, error: body.error || 'Advice unavailable' };
    }
    return { ok: true, data: body.advice };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};
