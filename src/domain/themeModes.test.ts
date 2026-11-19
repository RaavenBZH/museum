import { describe, expect, it } from 'vitest';
import { isThemeMode, THEME_MODES } from './themeModes';

describe('isThemeMode', () => {
  it('accepts each mode of the system', () => {
    for (const mode of THEME_MODES) {
      expect(isThemeMode(mode)).toBe(true);
    }
  });

  it('rejects anything else, whatever its type', () => {
    // This is what guards the value read back from storage, which another tab,
    // an older version of the application or the visitor may have written.
    for (const value of ['', 'Sand', 'dark', null, undefined, 0, {}, ['sand']]) {
      expect(isThemeMode(value)).toBe(false);
    }
  });
});
