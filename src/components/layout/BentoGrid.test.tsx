import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BentoGrid } from './BentoGrid';

describe('BentoGrid', () => {
  it('lays the tiles out on two columns, and on four above the breakpoint', () => {
    const { container } = render(<BentoGrid>tiles</BentoGrid>);

    expect(container.querySelector('.bento')).toHaveClass(
      'grid',
      'grid-cols-2',
      'desktop:grid-cols-4',
    );
  });

  it('places tiles densely, so a short tile fills the hole a tall one leaves', () => {
    const { container } = render(<BentoGrid>tiles</BentoGrid>);

    expect(container.querySelector('.bento')).toHaveClass('grid-flow-dense');
  });

  it('takes the class of the block that holds it, without losing its own', () => {
    const { container } = render(<BentoGrid className="home-page__bento">tiles</BentoGrid>);

    expect(container.querySelector('.bento')).toHaveClass('home-page__bento', 'grid-cols-2');
  });
});
