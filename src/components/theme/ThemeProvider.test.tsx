import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { ThemeToggleButton } from './ThemeToggleButton';
import { THEME_STORAGE_KEY } from './themeModes';

function renderThemeToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggleButton />
    </ThemeProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeProvider', () => {
  it('follows the system preference until a mode is chosen', () => {
    renderThemeToggle();

    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('switches to the other mode and remembers the choice', async () => {
    const user = userEvent.setup();
    renderThemeToggle();

    await user.click(screen.getByRole('button', { name: 'Switch to Cocoa mode' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'cocoa');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('cocoa');
    expect(screen.getByRole('button', { name: 'Switch to Sand mode' })).toBeInTheDocument();
  });

  it('restores the mode saved by a previous visit', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'cocoa');

    renderThemeToggle();

    expect(document.documentElement).toHaveAttribute('data-theme', 'cocoa');
  });
});
