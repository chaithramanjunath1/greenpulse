import { describe, it, expect } from 'vitest';
import { validateCarbonPayload, validateAdvisorPayload, sanitizeString } from '../../server/validation-rules.js';

/* ═══════════════════════════════════════════════════════════════
   Validation Rules — Exhaustive Unit Tests
   ═══════════════════════════════════════════════════════════════ */

describe('sanitizeString', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(123)).toBe('');
    expect(sanitizeString({})).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('strips HTML tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
    expect(sanitizeString('normal <b>bold</b> text')).toBe('normal bold text');
  });

  it('truncates to 100 characters', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeString(long).length).toBe(100);
  });

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('');
  });
});

describe('validateCarbonPayload', () => {
  it('rejects null/undefined body', () => {
    expect(validateCarbonPayload(null).valid).toBe(false);
    expect(validateCarbonPayload(undefined).valid).toBe(false);
  });

  it('rejects body without entries array', () => {
    const result = validateCarbonPayload({ entries: 'not-array' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('entries');
  });

  it('rejects empty entries array', () => {
    const result = validateCarbonPayload({ entries: [] });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('At least one');
  });

  it('rejects more than 50 entries', () => {
    const entries = Array.from({ length: 51 }, () => ({ kind: 'sedan', amount: 10 }));
    const result = validateCarbonPayload({ entries });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Maximum 50');
  });

  it('rejects non-object entries', () => {
    const result = validateCarbonPayload({ entries: ['string'] });
    expect(result.valid).toBe(false);
  });

  it('rejects entries with missing kind', () => {
    const result = validateCarbonPayload({ entries: [{ amount: 10 }] });
    expect(result.valid).toBe(false);
  });

  it('rejects entries with empty kind', () => {
    const result = validateCarbonPayload({ entries: [{ kind: '  ', amount: 10 }] });
    expect(result.valid).toBe(false);
  });

  it('rejects entries with kind longer than 50 chars', () => {
    const result = validateCarbonPayload({ entries: [{ kind: 'a'.repeat(51), amount: 10 }] });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('50 characters');
  });

  it('rejects entries with non-number amount', () => {
    const result = validateCarbonPayload({ entries: [{ kind: 'sedan', amount: 'abc' }] });
    expect(result.valid).toBe(false);
  });

  it('rejects entries with negative amount', () => {
    const result = validateCarbonPayload({ entries: [{ kind: 'sedan', amount: -5 }] });
    expect(result.valid).toBe(false);
  });

  it('rejects entries with amount over 100000', () => {
    const result = validateCarbonPayload({ entries: [{ kind: 'sedan', amount: 100001 }] });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('100,000');
  });

  it('accepts valid payload', () => {
    const result = validateCarbonPayload({ entries: [{ kind: 'sedan', amount: 50 }] });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts multiple valid entries', () => {
    const result = validateCarbonPayload({
      entries: [
        { kind: 'sedan', amount: 50 },
        { kind: 'red_meat', amount: 2 },
      ],
    });
    expect(result.valid).toBe(true);
  });
});

describe('validateAdvisorPayload', () => {
  it('rejects null/undefined body', () => {
    expect(validateAdvisorPayload(null).valid).toBe(false);
    expect(validateAdvisorPayload(undefined).valid).toBe(false);
  });

  it('rejects non-number totalKg', () => {
    const result = validateAdvisorPayload({ totalKg: 'abc' });
    expect(result.valid).toBe(false);
  });

  it('rejects NaN totalKg', () => {
    const result = validateAdvisorPayload({ totalKg: NaN });
    expect(result.valid).toBe(false);
  });

  it('rejects negative totalKg', () => {
    const result = validateAdvisorPayload({ totalKg: -10 });
    expect(result.valid).toBe(false);
  });

  it('rejects totalKg over 1,000,000', () => {
    const result = validateAdvisorPayload({ totalKg: 1000001 });
    expect(result.valid).toBe(false);
  });

  it('rejects non-object bySector', () => {
    const result = validateAdvisorPayload({ totalKg: 100, bySector: 'string' });
    expect(result.valid).toBe(false);
  });

  it('rejects array bySector', () => {
    const result = validateAdvisorPayload({ totalKg: 100, bySector: [1, 2] });
    expect(result.valid).toBe(false);
  });

  it('rejects null bySector', () => {
    const result = validateAdvisorPayload({ totalKg: 100, bySector: null });
    expect(result.valid).toBe(false);
  });

  it('accepts valid payload', () => {
    const result = validateAdvisorPayload({ totalKg: 500, bySector: { commute: 200 } });
    expect(result.valid).toBe(true);
  });

  it('accepts payload without bySector', () => {
    const result = validateAdvisorPayload({ totalKg: 500 });
    expect(result.valid).toBe(true);
  });

  it('accepts zero totalKg', () => {
    const result = validateAdvisorPayload({ totalKg: 0 });
    expect(result.valid).toBe(true);
  });
});
