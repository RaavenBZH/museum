import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NextArtworkBar } from './NextArtworkBar';

describe('NextArtworkBar', () => {
  it('promises the next artwork without naming it, under the artwork itself', () => {
    render(<NextArtworkBar isContemplating={false} secondsLeft={0} onNext={() => {}} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('What next?');
    expect(screen.getByText('The next artwork stays a surprise.')).toBeInTheDocument();
    // The artwork's own title is the heading of the page, never this band's.
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('draws another artwork on demand, from its one action', async () => {
    const onNext = vi.fn();

    render(<NextArtworkBar isContemplating={false} secondsLeft={0} onNext={onNext} />);
    await userEvent.click(screen.getByRole('button', { name: 'Discover another' }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('holds the action shut while the visitor is given a moment to look', async () => {
    const onNext = vi.fn();

    render(<NextArtworkBar isContemplating secondsLeft={3} onNext={onNext} />);

    const action = screen.getByRole('button', { name: 'Discover another' });

    // Held with aria-disabled, so it keeps its place in the tab order and the
    // line explaining the wait stays reachable from the keyboard.
    expect(action).toHaveAttribute('aria-disabled', 'true');
    expect(action).toBeEnabled();

    await userEvent.click(action);

    expect(onNext).not.toHaveBeenCalled();
  });

  it('says how long is left, and ties that line to the action', () => {
    render(<NextArtworkBar isContemplating secondsLeft={2} onNext={() => {}} />);

    const action = screen.getByRole('button', { name: 'Discover another' });
    const wait = screen.getByText('Take a moment with this one — 2 s');

    expect(action).toHaveAttribute('aria-describedby', wait.id);
  });

  it('says the next artwork is on its way, when it has to be waited for', () => {
    render(
      <NextArtworkBar isContemplating={false} isAwaitingNext secondsLeft={0} onNext={() => {}} />,
    );

    expect(screen.getByText('Drawing the next artwork…')).toBeInTheDocument();
    expect(screen.queryByText(/Take a moment/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discover another' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('is the inverted block of the design system', () => {
    const { container } = render(
      <NextArtworkBar isContemplating={false} secondsLeft={0} onNext={() => {}} />,
    );

    expect(container.querySelector('.next-artwork-bar')).toHaveClass(
      'bg-inverse-bg',
      'text-inverse-text',
      'rounded-card',
    );
  });
});
