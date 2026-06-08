import { Router } from 'express';
import { validateCarbonPayload } from './validation-rules.js';
import { obtainEcoAdvice } from './carbon-advisor.js';

export const carbonRouter = Router();

/* ── Emission coefficients (flat map — NOT nested like Terravue) ── */
const COEFFICIENTS = {
  sedan: 0.19,
  suv: 0.28,
  motorbike: 0.11,
  metro: 0.065,
  rail: 0.035,
  airline_domestic: 0.24,
  airline_overseas: 0.18,
  pedal: 0,
  on_foot: 0,
  red_meat: 7.2,
  poultry: 1.9,
  seafood: 1.5,
  dairy_product: 1.2,
  plant_based: 0.3,
  grains: 1.1,
  bakery: 0.3,
  grid_power: 0.45,
  gas_heating: 0.2,
  fuel_oil: 2.7,
  garment: 12,
  gadget: 55,
  home_goods: 80,
};

const SECTOR_MAP = {
  sedan: 'commute', suv: 'commute', motorbike: 'commute', metro: 'commute',
  rail: 'commute', airline_domestic: 'commute', airline_overseas: 'commute',
  pedal: 'commute', on_foot: 'commute',
  red_meat: 'diet', poultry: 'diet', seafood: 'diet', dairy_product: 'diet',
  plant_based: 'diet', grains: 'diet', bakery: 'diet',
  grid_power: 'household', gas_heating: 'household', fuel_oil: 'household',
  garment: 'consumption', gadget: 'consumption', home_goods: 'consumption',
};

/**
 * POST /api/v1/carbon/evaluate
 * Calculate carbon footprint from a list of activity entries.
 */
carbonRouter.post('/carbon/evaluate', (req, res) => {
  const check = validateCarbonPayload(req.body);
  if (!check.valid) {
    return res.status(400).json({ error: 'Invalid payload', details: check.errors });
  }

  const entries = req.body.entries;
  const results = [];
  const sectorTotals = {};

  for (const entry of entries) {
    const factor = COEFFICIENTS[entry.kind];
    if (factor === undefined) {
      results.push({ kind: entry.kind, kg: 0, note: 'unknown activity type' });
      continue;
    }

    const kg = factor * entry.amount;
    const sector = SECTOR_MAP[entry.kind] || 'other';
    sectorTotals[sector] = (sectorTotals[sector] || 0) + kg;
    results.push({ kind: entry.kind, kg: Math.round(kg * 100) / 100, sector });
  }

  const totalKg = results.reduce((sum, r) => sum + r.kg, 0);

  res.json({
    totalKg: Math.round(totalKg * 100) / 100,
    bySector: sectorTotals,
    breakdown: results,
  });
});

/**
 * GET /api/v1/carbon/benchmarks
 * Return average emission benchmarks for comparison.
 */
carbonRouter.get('/carbon/benchmarks', (_req, res) => {
  res.json({
    globalAverageKg: 4700,
    nationalAverageKg: 4000,
    targetKg: 2500,
    sectors: {
      commute: { label: 'Transportation', avgKg: 1200 },
      diet: { label: 'Food & Diet', avgKg: 1100 },
      household: { label: 'Home Energy', avgKg: 1000 },
      consumption: { label: 'Shopping', avgKg: 700 },
    },
  });
});

/**
 * POST /api/v1/advisor/suggest
 * Get AI-powered personalized reduction advice.
 */
carbonRouter.post('/advisor/suggest', async (req, res) => {
  try {
    const profile = req.body;
    if (!profile || typeof profile.totalKg !== 'number') {
      return res.status(400).json({ error: 'Missing totalKg in request body' });
    }
    const advice = await obtainEcoAdvice(profile);
    res.json({ advice });
  } catch (err) {
    console.error('[Advisor Error]', err.message);
    res.status(502).json({ error: 'Advice service temporarily unavailable' });
  }
});
