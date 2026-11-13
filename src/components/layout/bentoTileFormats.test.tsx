import { describe, expect, it } from 'vitest';
import { bentoTileClassName } from './bentoTileFormats';

describe('bentoTileClassName', () => {
  it('gives each format the span its artwork deserves', () => {
    expect(bentoTileClassName('headline')).toContain('col-span-2');
    expect(bentoTileClassName('headline')).toContain('row-span-6');
    expect(bentoTileClassName('portrait')).toContain('row-span-5');
    expect(bentoTileClassName('small')).toContain('row-span-2');
  });

  it('leaves narrow tiles on one column, so the same class holds on mobile', () => {
    expect(bentoTileClassName('small')).not.toContain('col-span');
    expect(bentoTileClassName('panoramic')).toContain('col-span-2');
  });
});
