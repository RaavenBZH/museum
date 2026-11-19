import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GridIcon } from './GridIcon';
import { ListIcon } from './ListIcon';

describe.each([
  ['GridIcon', GridIcon],
  ['ListIcon', ListIcon],
])('%s', (_name, Icon) => {
  it('is decorative: the word beside it names the layout', () => {
    const { container } = render(<Icon />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is drawn at the size and stroke of every other icon of the system', () => {
    const { container } = render(<Icon />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    expect(icon).toHaveAttribute('stroke-width', '2');
    expect(icon).toHaveAttribute('fill', 'none');
  });
});
