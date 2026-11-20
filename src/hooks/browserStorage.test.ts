import { afterEach, describe, expect, it, vi } from 'vitest';
import { readStorage, writeStorage } from './browserStorage';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('browser storage', () => {
  it('reads back what it wrote', () => {
    writeStorage('museum:test', 'kept');

    expect(readStorage('museum:test')).toBe('kept');
  });

  it('reads nothing for a key never written', () => {
    expect(readStorage('museum:never')).toBeNull();
  });

  it('reads nothing, rather than failing, when the browser blocks storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(readStorage('museum:test')).toBeNull();
  });

  it('keeps going when the browser refuses to store anything', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });

    expect(() => writeStorage('museum:test', 'value')).not.toThrow();
  });
});
