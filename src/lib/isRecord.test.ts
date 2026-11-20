import { describe, expect, it } from 'vitest';
import { isRecord } from './isRecord';

describe('isRecord', () => {
  it('accepts a JSON object, the shape of every payload and every kept entry', () => {
    expect(isRecord({ total: 1 })).toBe(true);
    expect(isRecord({})).toBe(true);
  });

  it('rejects what cannot be read field by field', () => {
    for (const value of [null, undefined, [], [1, 2], 'total', 7, true]) {
      expect(isRecord(value)).toBe(false);
    }
  });
});
