/* ═══════════════════════════════════════════════════════════════
   CarbonMath — Pure emission calculation functions
   All coefficients sourced from IPCC / EPA averages
   ═══════════════════════════════════════════════════════════════ */

const COMMUTE_FACTORS = {
  sedan: 0.19,
  suv: 0.28,
  motorbike: 0.11,
  metro: 0.065,
  rail: 0.035,
  airline_domestic: 0.24,
  airline_overseas: 0.18,
  pedal: 0,
  on_foot: 0,
};

const DIET_FACTORS = {
  red_meat: 7.2,
  poultry: 1.9,
  seafood: 1.5,
  dairy_product: 1.2,
  plant_based: 0.3,
  grains: 1.1,
  bakery: 0.3,
};

const ENERGY_FACTORS = {
  grid_power: 0.45,
  gas_heating: 0.2,
  fuel_oil: 2.7,
};

const PURCHASE_FACTORS = {
  garment: 12,
  gadget: 55,
  home_goods: 80,
};

const SECTOR_LOOKUP = {
  sedan: 'commute', suv: 'commute', motorbike: 'commute', metro: 'commute',
  rail: 'commute', airline_domestic: 'commute', airline_overseas: 'commute',
  pedal: 'commute', on_foot: 'commute',
  red_meat: 'diet', poultry: 'diet', seafood: 'diet', dairy_product: 'diet',
  plant_based: 'diet', grains: 'diet', bakery: 'diet',
  grid_power: 'household', gas_heating: 'household', fuel_oil: 'household',
  garment: 'consumption', gadget: 'consumption', home_goods: 'consumption',
};

/**
 * Compute CO2 output for a commute activity.
 * @param {string} vehicleKind - e.g. 'sedan', 'metro', 'pedal'
 * @param {number} kilometers - Distance traveled
 * @returns {number} kg of CO2 equivalent
 */
export const computeCommuteOutput = (vehicleKind, kilometers) => {
  const factor = COMMUTE_FACTORS[vehicleKind];
  if (factor === undefined || typeof kilometers !== 'number' || kilometers < 0) {
    return 0;
  }
  return Math.round(factor * kilometers * 100) / 100;
};

/**
 * Compute CO2 for dietary choices.
 * @param {string} mealCategory - e.g. 'red_meat', 'poultry', 'plant_based'
 * @param {number} portions - Number of servings
 * @returns {number} kg CO2e
 */
export const computeDietaryOutput = (mealCategory, portions) => {
  const factor = DIET_FACTORS[mealCategory];
  if (factor === undefined || typeof portions !== 'number' || portions < 0) {
    return 0;
  }
  return Math.round(factor * portions * 100) / 100;
};

/**
 * Compute CO2 for household energy usage.
 * @param {string} sourceKind - e.g. 'grid_power', 'gas_heating', 'fuel_oil'
 * @param {number} consumption - kWh or liters consumed
 * @returns {number} kg CO2e
 */
export const computeEnergyOutput = (sourceKind, consumption) => {
  const factor = ENERGY_FACTORS[sourceKind];
  if (factor === undefined || typeof consumption !== 'number' || consumption < 0) {
    return 0;
  }
  return Math.round(factor * consumption * 100) / 100;
};

/**
 * Compute CO2 for consumer purchases.
 * @param {string} goodsType - e.g. 'garment', 'gadget', 'home_goods'
 * @param {number} count - Number of items
 * @returns {number} kg CO2e
 */
export const computePurchaseOutput = (goodsType, count) => {
  const factor = PURCHASE_FACTORS[goodsType];
  if (factor === undefined || typeof count !== 'number' || count < 0) {
    return 0;
  }
  return Math.round(factor * count * 100) / 100;
};

/**
 * Map an activity kind to its sector name.
 * @param {string} kind - Activity kind string
 * @returns {string} Sector name or 'other'
 */
export const resolveSector = (kind) => {
  return SECTOR_LOOKUP[kind] || 'other';
};

/**
 * Compute emission for any single activity entry.
 * @param {string} kind - Activity kind
 * @param {number} amount - Quantity (km, servings, kWh, or count)
 * @returns {number} kg CO2e
 */
export const computeSingleEntry = (kind, amount) => {
  if (COMMUTE_FACTORS[kind] !== undefined) {
    return computeCommuteOutput(kind, amount);
  }
  if (DIET_FACTORS[kind] !== undefined) {
    return computeDietaryOutput(kind, amount);
  }
  if (ENERGY_FACTORS[kind] !== undefined) {
    return computeEnergyOutput(kind, amount);
  }
  if (PURCHASE_FACTORS[kind] !== undefined) {
    return computePurchaseOutput(kind, amount);
  }
  return 0;
};

/**
 * Aggregate total emissions from a collection of logged activities.
 * @param {Array<{kind: string, amount: number}>} entries
 * @returns {{ totalKg: number, bySector: Object<string, number> }}
 */
export const aggregateEmissions = (entries) => {
  if (!Array.isArray(entries)) {
    return { totalKg: 0, bySector: {} };
  }

  let totalKg = 0;
  const bySector = {};

  for (const entry of entries) {
    if (!entry || typeof entry.kind !== 'string' || typeof entry.amount !== 'number') {
      continue;
    }

    const kg = computeSingleEntry(entry.kind, entry.amount);
    const sector = resolveSector(entry.kind);

    totalKg += kg;
    bySector[sector] = (bySector[sector] || 0) + kg;
  }

  totalKg = Math.round(totalKg * 100) / 100;

  for (const key of Object.keys(bySector)) {
    bySector[key] = Math.round(bySector[key] * 100) / 100;
  }

  return { totalKg, bySector };
};

/**
 * Format a kg CO2 value for display.
 * @param {number} kg
 * @returns {string}
 */
export const renderCarbonLabel = (kg) => {
  if (typeof kg !== 'number' || isNaN(kg)) {
    return '0 kg';
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t`;
  }
  if (kg >= 10) {
    return `${Math.round(kg)} kg`;
  }
  if (kg > 0) {
    return `${kg.toFixed(2)} kg`;
  }
  return '0 kg';
};
