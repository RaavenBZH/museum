import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeModeSwitch } from './ThemeModeSwitch';
import { ThemeProvider } from './ThemeProvider';

function renderSwitch() {
  return render(
    <ThemeProvider>
      <ThemeModeSwitch />
    </ThemeProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeModeSwitch', () => {
  it('offers both modes at once, each one named', () => {
    renderSwitch();

    expect(screen.getByRole('group', { name: 'Display mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sand mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cocoa mode' })).toBeInTheDocument();
  });

  it('marks the mode on screen with more than a colour', async () => {
    const user = userEvent.setup();
    renderSwitch();

    await user.click(screen.getByRole('button', { name: 'Cocoa mode' }));

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
    renderSwitch();

    await user.click(screen.getByRole('button', { name: 'Cocoa mode' }));
    await user.click(screen.getByRole('button', { name: 'Cocoa mode' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'cocoa');
  });
});
