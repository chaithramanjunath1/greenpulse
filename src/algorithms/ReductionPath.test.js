import { describe, it, expect } from 'vitest';
import {
  generateActionPlan,
  projectSavings,
  prioritizeByLeverage,
} from './ReductionPath.js';

describe('generateActionPlan', () => {
  it('returns empty array for null profile', () => {
    expect(generateActionPlan(null)).toEqual([]);
  });

  it('returns empty array for profile without totalKg', () => {
    expect(generateActionPlan({ bySector: {} })).toEqual([]);
  });

  it('returns empty array for profile with string totalKg', () => {
    expect(generateActionPlan({ totalKg: 'abc' })).toEqual([]);
  });

  it('prioritizes actions from highest emission sectors', () => {
    const plan = generateActionPlan({
      totalKg: 1000,
      bySector: { commute: 600, diet: 200, household: 100, consumption: 100 },
    });
    expect(plan.length).toBeGreaterThan(0);
    expect(plan[0].sector).toBe('commute');
  });

  it('returns at most 8 actions', () => {
    const plan = generateActionPlan({
      totalKg: 5000,
      bySector: { commute: 2000, diet: 1500, household: 1000, consumption: 500 },
    });
    expect(plan.length).toBeLessThanOrEqual(8);
  });

  it('fills to minimum 5 if few sectors present', () => {
    const plan = generateActionPlan({
      totalKg: 500,
      bySector: { commute: 500 },
    });
    expect(plan.length).toBeGreaterThanOrEqual(5);
  });

  it('handles profile with missing bySector', () => {
    const plan = generateActionPlan({ totalKg: 100 });
    expect(plan.length).toBeGreaterThanOrEqual(5);
  });

  it('does not include duplicate action ids', () => {
    const plan = generateActionPlan({
      totalKg: 2000,
      bySector: { commute: 500, diet: 500, household: 500, consumption: 500 },
    });
    const ids = plan.map((a) => a.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });
});

describe('projectSavings', () => {
  it('returns zeros for invalid currentTotal', () => {
    expect(projectSavings(-1, [])).toEqual({
      projectedTotal: 0, totalSaved: 0, reductionPercent: 0,
    });
  });

  it('returns zeros for non-number currentTotal', () => {
    expect(projectSavings('abc', [])).toEqual({
      projectedTotal: 0, totalSaved: 0, reductionPercent: 0,
    });
  });

  it('returns current total when no actions adopted', () => {
    expect(projectSavings(1000, [])).toEqual({
      projectedTotal: 1000, totalSaved: 0, reductionPercent: 0,
    });
  });

  it('returns current total when actions is null', () => {
    expect(projectSavings(1000, null)).toEqual({
      projectedTotal: 1000, totalSaved: 0, reductionPercent: 0,
    });
  });

  it('calculates savings correctly', () => {
    const result = projectSavings(1000, [
      { potentialSaving: 200 },
      { potentialSaving: 300 },
    ]);
    expect(result.totalSaved).toBe(500);
    expect(result.projectedTotal).toBe(500);
    expect(result.reductionPercent).toBe(50);
  });

  it('caps projectedTotal at zero', () => {
    const result = projectSavings(100, [
      { potentialSaving: 500 },
    ]);
    expect(result.projectedTotal).toBe(0);
    expect(result.reductionPercent).toBe(100);
  });

  it('caps reductionPercent at 100', () => {
    const result = projectSavings(50, [
      { potentialSaving: 200 },
      { potentialSaving: 300 },
    ]);
    expect(result.reductionPercent).toBe(100);
  });

  it('skips actions with invalid potentialSaving', () => {
    const result = projectSavings(1000, [
      { potentialSaving: 200 },
      null,
      { potentialSaving: 'bad' },
      { potentialSaving: 100 },
    ]);
    expect(result.totalSaved).toBe(300);
  });
});

describe('prioritizeByLeverage', () => {
  it('returns empty array for non-array input', () => {
    expect(prioritizeByLeverage(null)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(prioritizeByLeverage(undefined)).toEqual([]);
  });

  it('sorts by saving/effort ratio descending', () => {
    const actions = [
      { id: 'a', potentialSaving: 100, effort: 'significant' },
      { id: 'b', potentialSaving: 200, effort: 'minimal' },
      { id: 'c', potentialSaving: 150, effort: 'moderate' },
    ];
    const sorted = prioritizeByLeverage(actions);
    expect(sorted[0].id).toBe('b');
    expect(sorted[1].id).toBe('c');
    expect(sorted[2].id).toBe('a');
  });

  it('does not include leverage property in output', () => {
    const sorted = prioritizeByLeverage([
      { id: 'x', potentialSaving: 50, effort: 'minimal' },
    ]);
    expect(sorted[0]).not.toHaveProperty('leverage');
  });

  it('handles unknown effort values', () => {
    const sorted = prioritizeByLeverage([
      { id: 'x', potentialSaving: 100, effort: 'unknown' },
    ]);
    expect(sorted.length).toBe(1);
  });
});
