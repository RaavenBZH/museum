import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChevronIcon } from './ChevronIcon';

describe('ChevronIcon', () => {
  it('points down on what is folded and up on what is open', () => {
    const { container: folded } = render(<ChevronIcon direction="down" />);
    const { container: open } = render(<ChevronIcon direction="up" />);

    expect(folded.querySelector('path')).toHaveAttribute('d', 'M6 9l6 6 6-6');
    expect(open.querySelector('path')).toHaveAttribute('d', 'M18 15l-6-6-6 6');
  });

  it('is decorative: the button around it says what it does', () => {
    const { container } = render(<ChevronIcon direction="down" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is drawn at the size and stroke of every other icon of the system', () => {
    const { container } = render(<ChevronIcon direction="down" />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    expect(icon).toHaveAttribute('stroke-width', '2');
  });
});
