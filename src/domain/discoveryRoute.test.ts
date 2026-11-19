import { describe, expect, it } from 'vitest';
import { discoverArtworkPath, parseArtworkIdParam } from './discoveryRoute';

describe('discoverArtworkPath', () => {
  it('names the artwork by the museum identifier', () => {
    expect(discoverArtworkPath(437984)).toBe('/discover/437984');
  });
});

describe('parseArtworkIdParam', () => {
  it('reads an identifier written in digits', () => {
    expect(parseArtworkIdParam('437984')).toBe(437984);
  });

  it('refuses anything that cannot be an identifier of the museum', () => {
    for (const param of [undefined, '', '0', '-4', '12abc', '1e3', '4.5', ' 12', '99999999999999999999']) {
      expect(parseArtworkIdParam(param)).toBeNull();
    }
  });
});
