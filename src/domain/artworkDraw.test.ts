import { describe, expect, it } from 'vitest';
import { drawArtworkId } from './artworkDraw';

describe('drawArtworkId', () => {
  it('draws from the list, at the position the generator points to', () => {
    expect(drawArtworkId([10, 20, 30], [], () => 0)).toBe(10);
    expect(drawArtworkId([10, 20, 30], [], () => 0.5)).toBe(20);
    // A generator returning exactly 1 would land past the end of the list.
    expect(drawArtworkId([10, 20, 30], [], () => 1)).toBe(30);
  });

  it('never draws an artwork that has already been seen', () => {
    expect(drawArtworkId([10, 20, 30], [10, 30], () => 0)).toBe(20);
    expect(drawArtworkId([10, 20, 30], [10, 30], () => 0.99)).toBe(20);
  });

  it('starts a fresh round rather than drawing nothing once everything is seen', () => {
    expect(drawArtworkId([10, 20], [10, 20], () => 0)).toBe(10);
  });

  it('has nothing to draw from an empty collection', () => {
    expect(drawArtworkId([], [], () => 0)).toBeNull();
  });
});
