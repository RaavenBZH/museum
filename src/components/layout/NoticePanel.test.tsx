import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NoticePanel } from './NoticePanel';

describe('NoticePanel', () => {
  it('is a screen in itself, so its heading is the first-level one', () => {
    render(<NoticePanel title="Drawing an artwork…" lead="Reading the collection." />);

    const panel = screen.getByRole('heading', { level: 1 });

    expect(panel).toHaveTextContent('Drawing an artwork…');
    expect(screen.getByText('Reading the collection.')).toBeInTheDocument();
  });

  it('is named by its own heading for assistive technology', () => {
    const { container } = render(<NoticePanel title="This page does not exist." lead="Nope." />);
    const panel = container.querySelector('.notice-panel');

    expect(panel).toHaveAttribute('aria-labelledby', screen.getByRole('heading').id);
  });

  it('announces a state when it is one, and stays quiet when it is not', () => {
    const { rerender } = render(
      <NoticePanel title="Drawing an artwork…" lead="Reading the collection." role="status" isBusy />,
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');

    rerender(<NoticePanel title="The collection is not answering" lead="Blocked." role="alert" />);

    expect(screen.getByRole('alert')).not.toHaveAttribute('aria-busy');

    rerender(<NoticePanel title="This page does not exist." lead="Nope." />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('carries the one way out when it is given one, and nothing when it is not', () => {
    const { rerender } = render(
      <NoticePanel title="Gone" lead="Nope." action={<button type="button">Try again</button>} />,
    );

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();

    rerender(<NoticePanel title="Gone" lead="Nope." />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
