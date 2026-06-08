import { describe, it, expect } from 'vitest';
import {
  computeCommuteOutput,
  computeDietaryOutput,
  computeEnergyOutput,
  computePurchaseOutput,
  resolveSector,
  computeSingleEntry,
  aggregateEmissions,
  renderCarbonLabel,
} from './CarbonMath.js';

describe('computeCommuteOutput', () => {
  it('returns correct kg for sedan', () => {
    expect(computeCommuteOutput('sedan', 100)).toBe(19);
  });
  it('returns correct kg for suv', () => {
    expect(computeCommuteOutput('suv', 50)).toBe(14);
  });
  it('returns correct kg for motorbike', () => {
    expect(computeCommuteOutput('motorbike', 200)).toBe(22);
  });
  it('returns correct kg for metro', () => {
    expect(computeCommuteOutput('metro', 30)).toBe(1.95);
  });
  it('returns correct kg for rail', () => {
    expect(computeCommuteOutput('rail', 100)).toBe(3.5);
  });
  it('returns correct kg for airline_domestic', () => {
    expect(computeCommuteOutput('airline_domestic', 500)).toBe(120);
  });
  it('returns correct kg for airline_overseas', () => {
    expect(computeCommuteOutput('airline_overseas', 1000)).toBe(180);
  });
  it('returns 0 for pedal', () => {
    expect(computeCommuteOutput('pedal', 50)).toBe(0);
  });
  it('returns 0 for on_foot', () => {
    expect(computeCommuteOutput('on_foot', 10)).toBe(0);
  });
  it('returns 0 for unknown vehicle', () => {
    expect(computeCommuteOutput('spaceship', 100)).toBe(0);
  });
  it('returns 0 for negative km', () => {
    expect(computeCommuteOutput('sedan', -10)).toBe(0);
  });
  it('returns 0 for non-number km', () => {
    expect(computeCommuteOutput('sedan', 'abc')).toBe(0);
  });
  it('returns 0 for undefined km', () => {
    expect(computeCommuteOutput('sedan', undefined)).toBe(0);
  });
  it('handles zero distance', () => {
    expect(computeCommuteOutput('sedan', 0)).toBe(0);
  });
});

describe('computeDietaryOutput', () => {
  it('returns correct kg for red_meat', () => {
    expect(computeDietaryOutput('red_meat', 2)).toBe(14.4);
  });
  it('returns correct kg for poultry', () => {
    expect(computeDietaryOutput('poultry', 3)).toBe(5.7);
  });
  it('returns correct kg for seafood', () => {
    expect(computeDietaryOutput('seafood', 1)).toBe(1.5);
  });
  it('returns correct kg for dairy_product', () => {
    expect(computeDietaryOutput('dairy_product', 4)).toBe(4.8);
  });
  it('returns correct kg for plant_based', () => {
    expect(computeDietaryOutput('plant_based', 5)).toBe(1.5);
  });
  it('returns correct kg for grains', () => {
    expect(computeDietaryOutput('grains', 2)).toBe(2.2);
  });
  it('returns correct kg for bakery', () => {
    expect(computeDietaryOutput('bakery', 10)).toBe(3);
  });
  it('returns 0 for unknown meal', () => {
    expect(computeDietaryOutput('candy', 5)).toBe(0);
  });
  it('returns 0 for negative portions', () => {
    expect(computeDietaryOutput('poultry', -2)).toBe(0);
  });
  it('returns 0 for null portions', () => {
    expect(computeDietaryOutput('poultry', null)).toBe(0);
  });
});

describe('computeEnergyOutput', () => {
  it('returns correct kg for grid_power', () => {
    expect(computeEnergyOutput('grid_power', 100)).toBe(45);
  });
  it('returns correct kg for gas_heating', () => {
    expect(computeEnergyOutput('gas_heating', 50)).toBe(10);
  });
  it('returns correct kg for fuel_oil', () => {
    expect(computeEnergyOutput('fuel_oil', 20)).toBe(54);
  });
  it('returns 0 for unknown source', () => {
    expect(computeEnergyOutput('solar', 100)).toBe(0);
  });
  it('returns 0 for negative consumption', () => {
    expect(computeEnergyOutput('grid_power', -5)).toBe(0);
  });
  it('returns 0 for non-number', () => {
    expect(computeEnergyOutput('grid_power', 'ten')).toBe(0);
  });
});

describe('computePurchaseOutput', () => {
  it('returns correct kg for garment', () => {
    expect(computePurchaseOutput('garment', 3)).toBe(36);
  });
  it('returns correct kg for gadget', () => {
    expect(computePurchaseOutput('gadget', 1)).toBe(55);
  });
  it('returns correct kg for home_goods', () => {
    expect(computePurchaseOutput('home_goods', 2)).toBe(160);
  });
  it('returns 0 for unknown goods', () => {
    expect(computePurchaseOutput('jewelry', 1)).toBe(0);
  });
  it('returns 0 for negative count', () => {
    expect(computePurchaseOutput('garment', -1)).toBe(0);
  });
  it('handles zero count', () => {
    expect(computePurchaseOutput('garment', 0)).toBe(0);
  });
});

describe('resolveSector', () => {
  it('maps sedan to commute', () => {
    expect(resolveSector('sedan')).toBe('commute');
  });
  it('maps red_meat to diet', () => {
    expect(resolveSector('red_meat')).toBe('diet');
  });
  it('maps grid_power to household', () => {
    expect(resolveSector('grid_power')).toBe('household');
  });
  it('maps garment to consumption', () => {
    expect(resolveSector('garment')).toBe('consumption');
  });
  it('returns other for unknown kind', () => {
    expect(resolveSector('magic')).toBe('other');
  });
});

describe('computeSingleEntry', () => {
  it('routes to commute calculator', () => {
    expect(computeSingleEntry('sedan', 100)).toBe(19);
  });
  it('routes to diet calculator', () => {
    expect(computeSingleEntry('red_meat', 1)).toBe(7.2);
  });
  it('routes to energy calculator', () => {
    expect(computeSingleEntry('grid_power', 10)).toBe(4.5);
  });
  it('routes to purchase calculator', () => {
    expect(computeSingleEntry('gadget', 2)).toBe(110);
  });
  it('returns 0 for unknown kind', () => {
    expect(computeSingleEntry('teleport', 999)).toBe(0);
  });
});

describe('aggregateEmissions', () => {
  it('returns zeros for empty array', () => {
    const result = aggregateEmissions([]);
    expect(result.totalKg).toBe(0);
    expect(result.bySector).toEqual({});
  });

  it('returns zeros for non-array input', () => {
    const result = aggregateEmissions(null);
    expect(result.totalKg).toBe(0);
    expect(result.bySector).toEqual({});
  });

  it('aggregates single entry', () => {
    const result = aggregateEmissions([{ kind: 'sedan', amount: 100 }]);
    expect(result.totalKg).toBe(19);
    expect(result.bySector.commute).toBe(19);
  });

  it('aggregates multiple entries across sectors', () => {
    const result = aggregateEmissions([
      { kind: 'sedan', amount: 100 },
      { kind: 'red_meat', amount: 2 },
      { kind: 'grid_power', amount: 50 },
    ]);
    expect(result.totalKg).toBe(55.9);
    expect(result.bySector.commute).toBe(19);
    expect(result.bySector.diet).toBe(14.4);
    expect(result.bySector.household).toBe(22.5);
  });

  it('skips invalid entries', () => {
    const result = aggregateEmissions([
      null,
      { kind: 'sedan', amount: 'bad' },
      { kind: 123, amount: 50 },
      { kind: 'sedan', amount: 10 },
    ]);
    expect(result.totalKg).toBe(1.9);
  });

  it('handles entries with unknown kinds', () => {
    const result = aggregateEmissions([
      { kind: 'sedan', amount: 10 },
      { kind: 'hoverboard', amount: 999 },
    ]);
    expect(result.totalKg).toBe(1.9);
    expect(result.bySector.commute).toBe(1.9);
  });
});

describe('renderCarbonLabel', () => {
  it('formats zero', () => {
    expect(renderCarbonLabel(0)).toBe('0 kg');
  });
  it('formats small values with decimals', () => {
    expect(renderCarbonLabel(3.45)).toBe('3.45 kg');
  });
  it('formats medium values as rounded kg', () => {
    expect(renderCarbonLabel(45.6)).toBe('46 kg');
  });
  it('formats large values in tonnes', () => {
    expect(renderCarbonLabel(2500)).toBe('2.5 t');
  });
  it('formats very large values in tonnes', () => {
    expect(renderCarbonLabel(15000)).toBe('15.0 t');
  });
  it('handles NaN', () => {
    expect(renderCarbonLabel(NaN)).toBe('0 kg');
  });
  it('handles non-number input', () => {
    expect(renderCarbonLabel('hello')).toBe('0 kg');
  });
  it('handles undefined', () => {
    expect(renderCarbonLabel(undefined)).toBe('0 kg');
  });
  it('formats boundary value 10', () => {
    expect(renderCarbonLabel(10)).toBe('10 kg');
  });
  it('formats boundary value 1000', () => {
    expect(renderCarbonLabel(1000)).toBe('1.0 t');
  });
  it('formats value just below 10', () => {
    expect(renderCarbonLabel(9.99)).toBe('9.99 kg');
  });
});
