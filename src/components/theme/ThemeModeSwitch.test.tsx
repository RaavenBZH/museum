import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ResolvedThemeMode } from '@/domain/themeModes';
import { ThemeModeSwitch } from './ThemeModeSwitch';

/**
 * The switch holds no state of its own, so it is rendered on its own: the mode
 * goes in as a prop and the choice comes back out as a call. What that call
 * then does to `<html>` is `ThemeProvider`'s test.
 */
function renderSwitch(resolvedMode: ResolvedThemeMode = 'sand') {
  const onModeChange = vi.fn();

  render(<ThemeModeSwitch resolvedMode={resolvedMode} onModeChange={onModeChange} />);

  return { onModeChange };
}

describe('ThemeModeSwitch', () => {
  it('offers both modes at once, each one named', () => {
    renderSwitch();

    expect(screen.getByRole('group', { name: 'Display mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sand mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cocoa mode' })).toBeInTheDocument();
  });

  it('marks the mode on screen with more than a colour', () => {
    renderSwitch('cocoa');

    expect(screen.getByRole('button', { name: 'Cocoa mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Sand mode' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('aims at a mode rather than toggling, so a side can be pressed twice', async () => {
    const user = userEvent.setup();
    const { onModeChange } = renderSwitch('cocoa');

    const cocoa = screen.getByRole('button', { name: 'Cocoa mode' });

    await user.click(cocoa);
    await user.click(cocoa);

    // Each press names the mode it wants, so pressing the current side again
    // asks for that same mode instead of leaving it.
    expect(onModeChange).toHaveBeenCalledTimes(2);
    expect(onModeChange).toHaveBeenLastCalledWith('cocoa');
  });

  it('pins the other mode when the other side is pressed', async () => {
    const user = userEvent.setup();
    const { onModeChange } = renderSwitch('cocoa');

    await user.click(screen.getByRole('button', { name: 'Sand mode' }));

    expect(onModeChange).toHaveBeenCalledWith('sand');
  });
});
