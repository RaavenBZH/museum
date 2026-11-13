import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('keeps a size of the type scale beside a colour of the palette', () => {
    expect(cn('text-caption-short', 'text-inverse-text')).toBe(
      'text-caption-short text-inverse-text',
    );
    expect(cn('text-tile-title', 'text-text-muted')).toBe('text-tile-title text-text-muted');
  });

  it('still resolves a real conflict, the last class winning', () => {
    expect(cn('text-lead', 'text-display')).toBe('text-display');
    expect(cn('text-text', 'text-accent')).toBe('text-accent');
  });
});
